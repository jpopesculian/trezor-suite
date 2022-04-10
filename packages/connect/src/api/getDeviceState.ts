import { AbstractMethod } from '../core/AbstractMethod';

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
