import { join } from 'path';
import * as fs from 'fs-extra';

import { resolveStaticPath } from '@trezor/utils';
import { GITBOOK_ASSETS_DIR_PREFIX } from './constants';

/**
 * A group of Guide content.
 * Can contain other Pages or Categories.
 * Cannot contain content on its own except the title.
 */
export interface Category {
    type: 'category';
    /** Serves both as unique identifier and relative path to the directory. */
    id: string;
    /** List of locales this Category is available in. */
    locales: string[];
    /** Titles keyed by locales. */
    title: {
        [key: string]: string;
    };
    image?: string;
    /** Sub-categories and sub-pages. */
    children: Node[];
}

/** A single unit of Guide content. */
export interface Page {
    type: 'page';
    id: string;
    locales: string[];
    title: {
        [key: string]: string;
    };
}

export type Node = Category | Page;

/** @returns true if given path is a directory. */
const isDirectory = (path: string): boolean => fs.lstatSync(path).isDirectory();

/** @returns true if left and right are variants of the same content. */
const match = (left: Node, right: Node): boolean =>
    left.type === right.type && left.id === right.id;

export class Parser {
    private source: string;

    constructor(source: string) {
        this.source = source;
    }

    /** Returns if given path is a root Node. */
    // eslint-disable-next-line arrow-body-style
    private isRootNode = (path: string): boolean => {
        // Handle the special case of the root of a locale
        // which doesn't contain a README.md.
        // Strip last 3 chars because locale (always two letters) and separator.
        return path.slice(0, -3) === this.source;
    };

    /** Returns a title of given directory. */
    private parseDirTitle(path: string): string {
        if (this.isRootNode(path)) {
            // A sensible fallback for title of the root Node.
            // Won't be shown in the UI anyway.
            return 'Suite Guide';
        }
        // For pages with children (i.e. Categories)
        // GitBook creates a directory with README.md.
        // Parse the title from there.
        return this.parsePageTitle(join(path, 'README.md'));
    }

    /** Returns a path to category image. */
    private parseCategoryImage(path: string): string | undefined {
        // No image for root node as it is not shown in the UI anyway
        if (this.isRootNode(path)) return;

        const doc = fs.readFileSync(join(path, 'README.md'));

        // Match image file name from markdown image syntax
        const image = doc
            .toString()
            .match(new RegExp(`(?<=${GITBOOK_ASSETS_DIR_PREFIX}/)(.*?)(?=\\))`))?.[0]
            // even non-special characters are escaped in markdown, they are escaped again if used in JSON
            // which creates unnecessary backslash which is then converted to slash in browser and breaks the image url
            ?.replace(/\\/g, '');

        return image ? resolveStaticPath(`/guide/${image}`) : undefined;
    }

    /** Returns a title of given page. */
    private parsePageTitle(path: string): string {
        const doc = fs.readFileSync(path);
        // In GitBook a title is edited in a dedicated field
        // and its content is added to the markdown file as level-1 heading.
        // Find the line that starts with a single hash.
        // Remove all backslashes in title which escape special characters in markdown syntax.

        try {
            return doc
                .toString()
                .match(/^# (.+$)/m)![1]!
                .replace(/[\\]/g, '')
                .trim();
        } catch (e) {
            throw new Error(`Could not parse title from ${path}.`);
        }
    }

    /** Converts given path to locale- and environment-agnostic id. */
    private pathToId(path: string): string {
        // Remove the environment-specific part of the path
        // and the locale.
        const id = path.slice(this.source.length + 3);
        if (id.length !== 0) {
            return id;
        }
        // Use `/` as id for the root Node.
        return '/';
    }

    /**
     * Given a path to a file-tree of localized GitBook content
     * recursively traverses and parses it and returns its
     * object representation.
     *
     * The returned representation is localized. Its
     * language must be set by the `locale` param as it
     * cannot be inferred from the content itself.
     *
     * @param path to root of the file-tree to start at.
     * @param locale locale of the given tree.
     * @returns object representation of the given tree.
     */
    private parseTree(path: string, locale: string): Node {
        if (isDirectory(path)) {
            const children = fs
                .readdirSync(path)
                // Ignore READMEs as they're only generated by GB for pages that have children
                // while we're only interested in content of leaf pages i.e. pages without children.
                .filter(child => child !== 'README.md')
                .map(child => this.parseTree(join(path, child), locale));

            return {
                type: 'category',
                id: this.pathToId(path),
                locales: [locale],
                title: {
                    [locale]: this.parseDirTitle(path),
                },
                image: this.parseCategoryImage(path),
                children,
            };
        }

        return {
            type: 'page',
            id: this.pathToId(path),
            locales: [locale],
            title: {
                [locale]: this.parsePageTitle(path),
            },
        };
    }

    /**
     * Recursively traverses the left Node and tries to find
     * matching content in the right node.
     * Matching nodes are merged and the result is returned.
     *
     * Nodes in the right that are not in the left are discarded.
     */
    private zip(left: Node, right: Node): Node {
        if (!match(left, right)) {
            return left;
        }

        const common = {
            ...left,
            locales: [...left.locales, ...right.locales],
            title: {
                ...left.title,
                ...right.title,
            },
        };

        if (left.type === 'page') {
            return common;
        }

        return {
            ...(common as Category),
            children: left.children.map(leftChild => {
                const rightChild = (right as Category).children.find(candidate =>
                    match(leftChild, candidate),
                );

                if (rightChild === undefined) {
                    console.warn(`Missing ${right.locales} alternative for ${leftChild.id}`);
                    return leftChild;
                }

                return this.zip(leftChild, rightChild);
            }),
        };
    }

    /** @returns list of all locales found in GitBook source. */
    private parseLocales(): string[] {
        // Use heuristics to distinguish locale directories from other files.
        return fs.readdirSync(this.source).filter(
            it =>
                // All locales should be 2 letters long.
                it.length === 2 &&
                // All locales should be GitBook groups and hence directories.
                isDirectory(join(this.source, it)),
        );
    }

    /**
     * Parses the GitBook content including all locales
     * and returns its object representation for subsequent processing.
     */
    parse(): Node {
        const locales = this.parseLocales();
        console.log(`Detected ${locales.length} locales: ${locales}`);

        // Parse the english content first.
        // It serves as the canonical version and defines the content tree.
        // All other locales can only provide alternative content to the english
        // Pages and Categories but can't define their own.
        const englishIndex = this.parseTree(join(this.source, 'en'), 'en');

        return (
            locales
                // Take all locales except the english one
                .filter(locale => locale !== 'en')
                // and merge them together.
                .reduce((englishIndex, locale) => {
                    // Parse the locale's version of the content.
                    const otherIndex = this.parseTree(join(this.source, locale), locale);
                    // Merge it into the english index.
                    return this.zip(englishIndex, otherIndex);
                }, englishIndex)
        );
    }
}
