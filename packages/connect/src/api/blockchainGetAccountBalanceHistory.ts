import { AbstractMethod } from '../core/AbstractMethod';
import { validateParams } from './common/paramsValidator';
import { ERRORS } from '../constants';

import { isBackendSupported, initBlockchain } from '../backend/BlockchainLink';
import { getCoinInfo } from '../data/CoinInfo';
import type { CoinInfo } from '../types';

// REF-TODO: direct import here? It safes few duplicated lines of code
import type { AccountBalanceHistoryParams } from '@trezor/blockchain-link/lib/types/params'; // TODO: export from B-L

type Params = {
    coinInfo: CoinInfo;
    request: AccountBalanceHistoryParams;
};

export default class BlockchainGetAccountBalanceHistory extends AbstractMethod<'blockchainGetAccountBalanceHistory'> {
    params: Params;

    init() {
        this.useDevice = false;
        this.useUi = false;

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', required: true },
            { name: 'descriptor', type: 'string', required: true },
            { name: 'from', type: 'number', required: false },
            { name: 'to', type: 'number', required: false },
            { name: 'groupBy', type: 'number', required: false },
        ]);

        const coinInfo = getCoinInfo(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // validate backend
        isBackendSupported(coinInfo);

        this.params = {
            coinInfo,
            request: {
                descriptor: payload.descriptor,
                from: payload.from,
                to: payload.to,
                groupBy: payload.groupBy,
            },
        };
    }

    async run() {
        const backend = await initBlockchain(this.params.coinInfo, this.postMessage);
        return backend.getAccountBalanceHistory(this.params.request);
    }
}
