/* eslint-disable @typescript-eslint/naming-convention */

import { MiddlewareAPI } from 'redux';
import { TRANSPORT, DEVICE } from 'trezor-connect';

import { SUITE, ROUTER, ANALYTICS } from '@suite-actions/constants';
import { DISCOVERY } from '@wallet-actions/constants';
import {
    isBitcoinOnly,
    getPhysicalDeviceCount,
    getFwVersion,
    isDeviceInBootloader,
    getBootloaderVersion,
    getFwRevision,
    getBootloaderHash,
} from '@suite-utils/device';
import { reportSuiteReadyAction } from '@suite-utils/analytics';

import type { AppState, Action, Dispatch } from '@suite-types';

/*
    In analytics middleware we may intercept actions we would like to log. For example:
    - trezor model
    - firmware version 
    - transport (webusb/bridge) and its version
    - backup type (shamir/bip39)
*/
const analyticsMiddleware =
    (api: MiddlewareAPI<Dispatch, AppState>) => (next: Dispatch) => (action: Action) => {
        const prevRouterUrl = api.getState().router.url;
        // pass action
        next(action);

        const state = api.getState();

        switch (action.type) {
            case ANALYTICS.INIT:
                // reporting can start when analytics is properly initialized and enabled
                reportSuiteReadyAction(state);
                break;
            case ANALYTICS.ENABLE:
                if (state.suite.flags.initialRun) {
                    // suite-ready event was not reported on analytics initialization because analytics was not yet confirmed
                    reportSuiteReadyAction(state);
                }
                break;
            case TRANSPORT.START:
                analytics.report({
                    type: 'transport-type',
                    payload: {
                        type: action.payload.type,
                        version: action.payload.version,
                    },
                });
                break;
            case DEVICE.CONNECT: {
                const { features, mode } = action.payload;

                if (!features) return;

                if (!isDeviceInBootloader(action.payload)) {
                    analytics.report({
                        type: 'device-connect',
                        payload: {
                            mode,
                            firmware: getFwVersion(action.payload),
                            firmwareRevision: getFwRevision(action.payload),
                            bootloaderHash: getBootloaderHash(action.payload),
                            backup_type: features.backup_type || 'Bip39',
                            pin_protection: features.pin_protection,
                            passphrase_protection: features.passphrase_protection,
                            totalInstances: state.devices.length,
                            isBitcoinOnly: isBitcoinOnly(action.payload),
                            totalDevices: getPhysicalDeviceCount(state.devices),
                            language: features.language,
                            model: features.model,
                        },
                    });
                } else {
                    analytics.report({
                        type: 'device-connect',
                        payload: {
                            mode: 'bootloader',
                            firmware: getFwVersion(action.payload),
                            bootloader: getBootloaderVersion(action.payload),
                        },
                    });
                }
                break;
            }
            case DEVICE.DISCONNECT:
                analytics.report({ type: 'device-disconnect' });
                break;
            case DISCOVERY.COMPLETE: {
                const accountsStatus = state.wallet.accounts
                    .filter(account => account.history.total + (account.history.unconfirmed || 0))
                    .reduce((acc: { [key: string]: number }, obj) => {
                        const id = `${obj.symbol}_${obj.accountType}`;
                        acc[id] = (acc[id] || 0) + 1;
                        return acc;
                    }, {});

                analytics.report({
                    type: 'accounts/status',
                    payload: { ...accountsStatus },
                });
                break;
            }
            case ROUTER.LOCATION_CHANGE:
                analytics.report({
                    type: 'router/location-change',
                    payload: {
                        prevRouterUrl,
                        nextRouterUrl: action.payload.url,
                    },
                });
                break;
            case SUITE.AUTH_DEVICE:
                analytics.report({
                    type: 'select-wallet-type',
                    payload: { type: action.payload.walletNumber ? 'hidden' : 'standard' },
                });
                break;
            case SUITE.TOR_STATUS:
                analytics.report({
                    type: 'menu/toggle-tor',
                    payload: {
                        value: action.payload,
                    },
                });
                break;

            default:
                break;
        }
        return action;
    };

export default analyticsMiddleware;
