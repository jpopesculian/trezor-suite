import { AbstractMethod } from '../core/AbstractMethod';
import { validateParams } from './common/paramsValidator';
import { ERRORS } from '../constants';
import Fees from './bitcoin/Fees';
import { isBackendSupported, initBlockchain } from '../backend/BlockchainLink';
import { getCoinInfo } from '../data/CoinInfo';
import type { CoinInfo } from '../types';
import type {
    BlockchainEstimateFee as BlockchainEstimateFeeParams,
    BlockchainEstimatedFee as BlockchainEstimatedFeeResponse,
} from '../types/api/blockchainEstimateFee';

type Request = BlockchainEstimateFeeParams['request'];

type Params = {
    coinInfo: CoinInfo;
    request: Request;
};

export default class BlockchainEstimateFee extends AbstractMethod<'blockchainEstimateFee'> {
    params: Params;

    init() {
        this.useDevice = false;
        this.useUi = false;

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', required: true },
            { name: 'request', type: 'object' },
        ]);

        const { request } = payload;

        if (request) {
            validateParams(request, [
                { name: 'blocks', type: 'array' },
                { name: 'specific', type: 'object' },
                { name: 'feeLevels', type: 'string' },
            ]);
            if (request.specific) {
                validateParams(request.specific, [
                    { name: 'conservative', type: 'boolean' },
                    { name: 'data', type: 'string' },
                    { name: 'from', type: 'string' },
                    { name: 'to', type: 'string' },
                    { name: 'txsize', type: 'number' },
                ]);
            }
        }
        const coinInfo = getCoinInfo(payload.coin);

        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // validate backend
        isBackendSupported(coinInfo);

        this.params = {
            coinInfo,
            request,
        };
    }

    async run() {
        const { coinInfo, request } = this.params;
        const feeInfo: BlockchainEstimatedFeeResponse = {
            blockTime: coinInfo.blocktime,
            minFee: coinInfo.minFee,
            maxFee: coinInfo.maxFee,
            dustLimit: coinInfo.type === 'bitcoin' ? coinInfo.dustLimit : undefined,
            levels: [],
        };
        if (request && request.feeLevels) {
            const fees = new Fees(coinInfo);
            // smart fees for DOGE are not relevant since their fee policy changed, see @trezor/utxo-lib/compose: baseFee
            if (request.feeLevels === 'smart' && coinInfo.shortcut !== 'DOGE') {
                const backend = await initBlockchain(coinInfo, this.postMessage);
                await fees.load(backend);
            }
            feeInfo.levels = fees.levels;
        } else {
            const backend = await initBlockchain(coinInfo, this.postMessage);
            // REF-TODO: 'blocks' and 'label' missing in what should be FeeLevel object
            // @ts-ignore
            feeInfo.levels = await backend.estimateFee(request || {});
        }

        return feeInfo;
    }
}
