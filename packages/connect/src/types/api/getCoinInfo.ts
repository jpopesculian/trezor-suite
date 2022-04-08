/**
 * Get static coin info
 */
import type { BlockchainParams, Response } from '../params';
import type { CoinInfo } from '../coinInfo';

export declare function getCoinInfo(params: BlockchainParams): Response<CoinInfo>;
