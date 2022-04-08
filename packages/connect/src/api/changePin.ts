import AbstractMethod from './abstractMethod';
import { validateParams } from './common/paramsValidator';
import type { MessageType } from '@trezor/transport/lib/types/messages';

export default class ChangePin extends AbstractMethod<'changePin'> {
    params: MessageType['ChangePin'];

    init() {
        this.requiredPermissions = ['management'];
        this.useDeviceState = false;

        const { payload } = this;
        validateParams(payload, [{ name: 'remove', type: 'boolean' }]);

        this.params = {
            remove: payload.remove,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('ChangePin', 'Success', this.params);
        return response.message;
    }
}
