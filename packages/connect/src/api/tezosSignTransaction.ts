import AbstractMethod from './abstractMethod';
import { validateParams, getFirmwareRange } from './common/paramsValidator';
import { getMiscNetwork } from '../data/CoinInfo';
import { validatePath } from '../utils/pathUtils';
import * as helper from './tezos/tezosSignTx';
import type { MessageType } from '@trezor/transport/lib/types/messages';

export default class TezosSignTransaction extends AbstractMethod<'tezosSignTransaction'> {
    params: MessageType['TezosSignTx'];

    init() {
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Tezos'),
            this.firmwareRange,
        );
        this.info = 'Sign Tezos transaction';

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', required: true },
            { name: 'branch', type: 'string', required: true },
            { name: 'operation', required: true },
        ]);

        const path = validatePath(payload.path, 3);
        this.params = helper.createTx(path, payload.branch, payload.operation);
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('TezosSignTx', 'TezosSignedTx', this.params);
        return response.message;
    }
}
