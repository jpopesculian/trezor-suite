const path = require('path');
const webpack = require('webpack');
const { compilerOptions } = require('../../../../tsconfig.aliases.json');

const { paths } = compilerOptions;
const pathKeys = Object.keys(paths).filter(p => !p.includes('*'));

const getPath = key => {
    let p = paths[key][0];
    if (p.endsWith('index')) {
        p = p.slice(0, -5);
    }

    return path.join('..', '..', p);
};

// Alias
const alias = {};
pathKeys.forEach(key => {
    alias[key] = path.resolve(getPath(key));
});

module.exports = {
    target: 'web',
    mode: 'development',
    // webpack will transpile TS and JS files
    resolve: {
        extensions: ['.ts', '.js'],
        alias,
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
        },
    },
    module: {
        rules: [
            {
                // every time webpack sees a TS file (except for node_modules)
                // webpack will use "ts-loader" to transpile it to JavaScript
                test: /\.ts$/,
                exclude: [/node_modules/],
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // skip typechecking for speed
                            transpileOnly: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        // provide fallback plugins
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
        }),
    ],
};
