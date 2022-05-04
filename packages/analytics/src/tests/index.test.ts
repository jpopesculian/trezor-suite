import { analytics } from '..';
import { getAnalyticsRandomId } from '../utils';
import { VERSION } from '../constants';

describe('Analytics', () => {
    beforeEach(() => {
        const mockFetchPromise = Promise.resolve({
            json: () => Promise.resolve({}),
        });
        global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);
        // @ts-ignore
        jest.spyOn(global, 'fetch').mockImplementation(() => mockFetchPromise);
    });

    it('should report if enabled and do not report when disabled', () => {
        const timestamp = new Date().getTime();
        jest.spyOn(Date, 'now').mockImplementation(() => timestamp);

        const app = 'suite';
        const environment = 'desktop';
        const isDev = false;
        const instanceId = getAnalyticsRandomId();
        const sessionId = getAnalyticsRandomId();
        const commitId = 'abc';

        analytics.init(true, { app, environment, isDev, instanceId, sessionId, commitId });

        const actionType1 = 'should-report';
        const actionType2 = 'should-not-report';

        analytics.report({ type: 'should-report' });

        expect(global.fetch).toHaveBeenNthCalledWith(
            1,
            `https://data.trezor.io/${app}/log/${environment}/stable.log?c_v=${VERSION}&c_type=${actionType1}&c_commit=${commitId}&c_instance_id=${instanceId}&c_session_id=${sessionId}&c_timestamp=${timestamp}`,
            { method: 'GET' },
        );
        expect(global.fetch).toHaveBeenCalledTimes(1);

        analytics.disable();
        analytics.report({ type: actionType2 });

        expect(global.fetch).toHaveBeenCalledTimes(1);

        analytics.enable();
        analytics.report({ type: actionType1 });

        expect(global.fetch).toHaveBeenCalledTimes(2);
    });
});
