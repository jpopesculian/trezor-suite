import AbstractMethod from './abstractMethod';

export default class GetDeviceState extends AbstractMethod<'getDeviceState'> {
    init() {
        this.requiredPermissions = [];
    }

    run() {
        return Promise.resolve({
            state: this.device.getExternalState(),
        });
    }
}
