/* eslint-disable camelcase */
/**
 * Analytics (logging user behavior in the app)
 * @docs docs/misc/analytics.md
 */

import { analytics } from '@trezor/analytics';

import { ANALYTICS } from '@suite-actions/constants';
import { getAnalyticsRandomId } from '@suite-utils/random';
import { allowSentryReport, setSentryUser } from '@suite-utils/sentry';
import { TrackingState } from '@suite-reducers/analyticsReducer';
import { isDev } from '@suite-utils/build';
import { getEnvironment } from '@suite-utils/env';

import type { Dispatch } from '@suite-types';

export type AnalyticsAction =
    | { type: typeof ANALYTICS.ENABLE }
    | { type: typeof ANALYTICS.DISPOSE }
    | {
          type: typeof ANALYTICS.INIT;
          payload: {
              instanceId: string;
              sessionId: string;
              enabled: boolean;
              confirmed: boolean;
          };
      };

/**
 * Init analytics, should be always run on application start (see suiteMiddleware). It:
 * - sets common analytics variables based on what was loaded from storage
 * - set sentry user id
 * @param state - tracking state loaded from storage
 */
export const init = (state: TrackingState) => (dispatch: Dispatch) => {
    // if instanceId does not exist yet (was not loaded from storage), create a new one
    const instanceId = state.instanceId || getAnalyticsRandomId();
    const sessionId = getAnalyticsRandomId();

    // if user made choice, keep it, otherwise set it to true by default just to prefill the confirmation toggle
    const isConfirmed = !!state.confirmed;
    const isEnabled = isConfirmed ? !!state.enabled : true;

    // set application state
    dispatch({
        type: ANALYTICS.INIT,
        payload: {
            instanceId,
            sessionId,
            enabled: isEnabled,
            confirmed: isConfirmed,
        },
    });

    // allow analytics and sentry reporting only if user already confirmed enabling of analytics
    const userAllowedAnalytics = isConfirmed && isEnabled;

    analytics.init(userAllowedAnalytics, {
        instanceId,
        sessionId,
        environment: getEnvironment(),
        app: 'suite',
        commitId: process.env.COMMITHASH || '',
        isDev,
        report: { sessionEnd: true },
    });

    allowSentryReport(userAllowedAnalytics);
    // set sentry user id same as instance id for analytics
    setSentryUser(instanceId);
};

export const enable = (): AnalyticsAction => {
    analytics.enable();
    analytics.report({ type: 'analytics/enable' });
    allowSentryReport(true);

    return {
        type: ANALYTICS.ENABLE,
    };
};

export const disable = (): AnalyticsAction => {
    analytics.disable();
    analytics.report({ type: 'analytics/dispose' }, true);
    allowSentryReport(false);

    return {
        type: ANALYTICS.DISPOSE,
    };
};
