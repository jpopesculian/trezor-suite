const fetch = require('node-fetch').default;

// testing build. yarn workspace @trezor/transport build:lib is a required step therefore
const TrezorLink = require('../../../../transport/lib').default;
const messages = require('../../../../transport/messages.json');

const { Controller } = global.Trezor;

const { BridgeV2 } = TrezorLink;

const controller = new Controller({
    url: 'ws://localhost:9001/',
});

jest.setTimeout(30000);

const mnemonicAll = 'all all all all all all all all all all all all';

const emulatorSetupOpts = {
    mnemonic: mnemonicAll,
    pin: '',
    passphrase_protection: false,
    label: 'TrezorT',
    needs_backup: true,
};

const emulatorStartOpts = { version: '2-master', wipe: true };

describe('bridge', () => {
    beforeAll(async () => {
        await controller.connect();
    });

    afterAll(() => {
        controller.disconnect();
    });

    // there might be more versions of bridge out there, see https://github.com/trezor/webwallet-data/tree/master/bridge
    // but they are not available from trezor-user-env, see https://github.com/trezor/trezor-user-env/tree/master/src/binaries/trezord-go/bin
    ['2.0.26', '2.0.27', undefined].forEach(bridgeVersion => {
        describe(bridgeVersion || 'latest', () => {
            let bridge;
            let devices;
            let session;
            beforeEach(async () => {
                await controller.send({ type: 'bridge-stop' });
                await controller.send({ type: 'emulator-start', ...emulatorStartOpts });
                await controller.send({ type: 'emulator-setup', ...emulatorSetupOpts });
                await controller.send({ type: 'bridge-start', version: bridgeVersion });

                BridgeV2.setFetch(fetch, true);

                bridge = new BridgeV2(null, null);
                await bridge.init(false);
                bridge.configure(messages);

                devices = await bridge.enumerate();

                expect(devices).toEqual([
                    {
                        path: '1',
                        session: null,
                        debugSession: null,
                        product: 0,
                        vendor: 0,
                        debug: true,
                    },
                ]);

                session = await bridge.acquire({ path: devices[0].path }, false);
            });

            test(`Call(GetFeatures)`, async () => {
                const message = await bridge.call(session, 'GetFeatures', {}, false);
                expect(message).toMatchObject({
                    type: 'Features',
                    message: {
                        vendor: 'trezor.io',
                        label: 'TrezorT',
                    },
                });
            });

            test(`post(GetFeatures) - read`, async () => {
                const postResponse = await bridge.post(session, 'GetFeatures', {}, false);
                expect(postResponse).toEqual(undefined);

                const readResponse = await bridge.read(session, false);
                expect(readResponse).toMatchObject({
                    type: 'Features',
                    message: {
                        vendor: 'trezor.io',
                        label: 'TrezorT',
                    },
                });
            });

            test(`call(ChangePin) - post(Cancel) - read`, async () => {
                // initiate change pin procedure on device
                const callResponse = await bridge.call(session, 'ChangePin', {}, false);
                expect(callResponse).toMatchObject({
                    type: 'ButtonRequest',
                });

                // cancel change pin procedure
                const postResponse = await bridge.post(session, 'Cancel', {}, false);
                expect(postResponse).toEqual(undefined);

                // read response
                const readResponse = await bridge.read(session, false);
                expect(readResponse).toMatchObject({
                    type: 'Failure',
                    message: {
                        code: 'Failure_ActionCancelled',
                        message: 'Cancelled',
                    },
                });

                // validate that we can continue with communication
                const message = await bridge.call(session, 'GetFeatures', {}, false);
                expect(message).toMatchObject({
                    type: 'Features',
                    message: {
                        vendor: 'trezor.io',
                        label: 'TrezorT',
                    },
                });
            });

            test(`call(Backup) - post(Cancel) - read`, async () => {
                // initiate change pin procedure on device
                const callResponse = await bridge.call(session, 'BackupDevice', {}, false);
                expect(callResponse).toMatchObject({
                    type: 'ButtonRequest',
                });

                // cancel change pin procedure
                const postResponse = await bridge.post(session, 'Cancel', {}, false);
                expect(postResponse).toEqual(undefined);

                // read response
                const readResponse = await bridge.read(session, false);
                expect(readResponse).toMatchObject({
                    type: 'Failure',
                    message: {
                        code: 'Failure_ActionCancelled',
                        message: 'Cancelled',
                    },
                });

                // validate that we can continue with communication
                const message = await bridge.call(session, 'GetFeatures', {}, false);
                expect(message).toMatchObject({
                    type: 'Features',
                    message: {
                        vendor: 'trezor.io',
                        label: 'TrezorT',
                    },
                });
            });
        });
    });
});
