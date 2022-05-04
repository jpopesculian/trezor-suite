import { getWeakRandomId } from '@trezor/utils';
import { VERSION } from './constants';

import type { App, Environment, Event } from './types';

export const getAnalyticsRandomId = () => getWeakRandomId(10);

export const getUrl = (app: App, environment: Environment, isDev: boolean) => {
    const base = `https://data.trezor.io/${app}/log/${environment}`;

    if (isDev) {
        return `${base}/develop.log`;
    }

    return `${base}/stable.log`;
};

export const encodeDataToQueryString = (
    instanceId: string,
    sessionId: string,
    commitId: string,
    event: Event,
) => {
    const { type } = event;

    // TODO: URLSearchParams missing in react-native
    const params = new URLSearchParams({
        // eslint-disable @typescript-eslint/naming-convention
        c_v: VERSION,
        c_type: type || '',
        c_commit: commitId,
        c_instance_id: instanceId,
        c_session_id: sessionId,
        c_timestamp: Date.now().toString(),
        // eslint-enable @typescript-eslint/naming-convention
    });

    if (event.payload) {
        Object.entries(event.payload).forEach(([key, value]) =>
            params.append(key, value?.toString() ?? ''),
        );
    }

    return params.toString();
};
