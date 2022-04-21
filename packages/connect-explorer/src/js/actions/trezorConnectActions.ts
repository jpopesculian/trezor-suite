import TrezorConnect, { DEVICE, DEVICE_EVENT, TRANSPORT_EVENT } from '@trezor/connect-web';

import { TrezorConnectDevice, Dispatch } from '../types';
import * as ACTIONS from './index';

type ConnectOptions = Parameters<typeof TrezorConnect['init']>[0];
export type TrezorConnectAction =
    | { type: typeof ACTIONS.ON_SELECT_DEVICE; path: string }
    | { type: typeof DEVICE.CONNECT; device: TrezorConnectDevice }
    | { type: typeof DEVICE.CONNECT_UNACQUIRED; device: TrezorConnectDevice }
    | { type: typeof DEVICE.DISCONNECT; device: TrezorConnectDevice }
    | { type: typeof ACTIONS.ON_CHANGE_CONNECT_OPTIONS; payload: ConnectOptions };

export function onSelectDevice(path: string) {
    return {
        type: ACTIONS.ON_SELECT_DEVICE,
        path,
    };
}

export const init =
    (options: Partial<Parameters<typeof TrezorConnect['init']>[0]> = {}) =>
    async (dispatch: Dispatch) => {
        window.TrezorConnect = TrezorConnect;

        TrezorConnect.on(DEVICE_EVENT, event => {
            dispatch({
                type: event.type,
                device: event.payload,
            });
        });

        TrezorConnect.on(TRANSPORT_EVENT, event => {
            // this type of event should not be emitted in "popup mode"
        });

        const { origin } = window.location;
        let connectSrc = '';
        if (origin.indexOf('localhost') > -1) {
            // use local connect for local development
            connectSrc = `${window.location.origin}/`;
        }
        if (origin.indexOf('sldev.cz') > -1) {
            // REF-TODO use sldev structure (current branch name)
            console.warn(window.location);
            connectSrc = `${window.location.origin}/`;
        }

        const connectOptions = {
            connectSrc,
            webusb: true,
            transportReconnect: true,
            popup: true,
            debug: true,
            lazyLoad: true,
            manifest: {
                email: 'info@trezor.io',
                appUrl: '@trezor/suite',
            },
            ...options,
        };

        try {
            await TrezorConnect.init(connectOptions);
        } catch (err) {
            console.log('ERROR', err);
            return;
        }

        dispatch({ type: ACTIONS.ON_CHANGE_CONNECT_OPTIONS, payload: connectOptions });
    };
