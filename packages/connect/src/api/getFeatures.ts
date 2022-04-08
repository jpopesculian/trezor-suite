import AbstractMethod from './abstractMethod';
import { UI } from '../events';

export default class GetFeatures extends AbstractMethod<'getFeatures'> {
    init() {
        this.requiredPermissions = [];
        this.useUi = false;
        this.allowDeviceMode = [...this.allowDeviceMode, UI.INITIALIZE, UI.BOOTLOADER];
        this.useDeviceState = false;
        this.skipFirmwareCheck = true;
    }

    run() {
        return Promise.resolve(this.device.features);
    }
}
