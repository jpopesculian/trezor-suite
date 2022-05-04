import { encodeDataToQueryString, getAnalyticsRandomId, getUrl } from './utils';

import type { Event, InitOptions } from './types';

export class Analytics {
    private static instance: Analytics;

    private enabled = false;
    private sessionStart = Date.now();
    private instanceId?: string;
    private sessionId?: string;
    private commitId?: string;
    private url?: string;

    constructor() {
        if (!Analytics.instance) {
            Analytics.instance = this;
        }
        return Analytics.instance;
    }

    public init = (enabled: boolean, options: InitOptions) => {
        this.enabled = enabled;

        this.instanceId = options.instanceId || getAnalyticsRandomId();
        this.sessionId = options.sessionId || getAnalyticsRandomId();
        this.commitId = options.commitId;
        this.url = getUrl(options.app, options.environment, options.isDev);

        if (options?.report?.sessionEnd) this.sessionEnd();
    };

    public enable = () => {
        this.enabled = true;
    };

    public disable = () => {
        this.enabled = false;
    };

    public isEnabled = () => this.enabled;

    /**
     * Reports event data to analytics.
     *
     * @param {Event} data
     * @param {boolean} force log to analytics even its not enabled.
     */
    public report = (data: Event, force = false) => {
        // TODO: initiate in suite earlier, enable later
        if (!this.url || !this.instanceId || !this.sessionId || !this.commitId) {
            console.error('Unable to report. Analytics is not initialized');
            return;
        }

        if (!this.enabled && !force) {
            return;
        }

        const qs = encodeDataToQueryString(this.instanceId, this.sessionId, this.commitId, data);

        try {
            fetch(`${this.url}?${qs}`, {
                method: 'GET',
            });
        } catch (err) {
            console.error('Failed to log analytics', err);
        }
    };

    private sessionEnd = () =>
        window.addEventListener('beforeunload', () =>
            this.report({
                type: 'session-end',
                payload: {
                    start: this.sessionStart,
                    end: Date.now(),
                },
            }),
        );
}
