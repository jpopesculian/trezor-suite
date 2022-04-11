import { AbstractMethod } from '../core/AbstractMethod';

// Empty placeholder for all Lisk methods
// FirmwareRange is set to "0" for both T1 and TT
// This should be removed in next major version of connect

export default class LiskDeprecated extends AbstractMethod<any> {
    init() {
        this.firmwareRange = {
            1: { min: '0', max: '0' },
            2: { min: '0', max: '0' },
        };
        this.info = 'Lisk not supported';
    }

    // @ts-expect-error
    run() {
        throw new Error(this.info);
    }
}
