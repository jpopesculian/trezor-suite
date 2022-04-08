import AbstractMethod from './abstractMethod';
import { validateParams, getFirmwareRange } from './common/paramsValidator';
import { getMiscNetwork } from '../data/CoinInfo';
import { validatePath } from '../utils/pathUtils';
import * as helper from './nem/nemSignTx';

import type { MessageType } from '@trezor/transport/lib/types/messages';

export default class NEMSignTransaction extends AbstractMethod<'nemSignTransaction'> {
    params: MessageType['NEMSignTx'];

    init() {
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('NEM'), this.firmwareRange);
        this.info = 'Sign NEM transaction';

        const { payload } = this;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', required: true },
            { name: 'transaction', required: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in nem-sdk format
        this.params = helper.createTx(payload.transaction, path);
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('NEMSignTx', 'NEMSignedTx', this.params);
        return response.message;
    }
}
