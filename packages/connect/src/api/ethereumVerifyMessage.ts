import AbstractMethod from './abstractMethod';
import { validateParams, getFirmwareRange } from './common/paramsValidator';
import { stripHexPrefix, messageToHex } from '../utils/formatUtils';
import type { MessageType } from '@trezor/transport/lib/types/messages';

export default class EthereumVerifyMessage extends AbstractMethod<'ethereumVerifyMessage'> {
    params: MessageType['EthereumVerifyMessage'];

    init() {
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Verify message';

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'address', type: 'string', required: true },
            { name: 'signature', type: 'string', required: true },
            { name: 'message', type: 'string', required: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const messageHex = payload.hex
            ? messageToHex(payload.message)
            : Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            address: stripHexPrefix(payload.address),
            signature: stripHexPrefix(payload.signature),
            message: messageHex,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('EthereumVerifyMessage', 'Success', this.params);
        return response.message;
    }
}
