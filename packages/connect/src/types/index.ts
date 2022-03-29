// import type { TrezorConnect } from './api';

// TODO: like this from all files?
// export type { ConnectSettings } from './api/init';
// export type { Manifest } from './api/manifest';

// export type ParamsOf<T extends keyof TrezorConnect> = Parameters<TrezorConnect[T]>;
// export type ResponseOf<T extends keyof TrezorConnect> = ReturnType<TrezorConnect[T]>;
// type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
// export type DeferredResponse<D> = D extends ResponseOf<infer R> ? R : never;

// type F0 = ParamsOf<'applyFlags'>[0];
// type F = Extract<Awaited<ResponseOf<'getAddress'>>, { success: true }>['payload'];
// type F1 = ResponseOf<'getAddress'>;
// type F2 = TrezorConnect['getAddress'];

// export const f: F = {
//     message: '',
//     // flags: 1,
// };

// TODO: export from B-L

import type { Transaction } from '@trezor/blockchain-link/lib/types/common';

export * from './api';
export * from './account';
export * from './coinInfo';
export * from './device';
export * from './params';
export * from './settings';

// REF-TODO: added for backwards compatibility with imports in @trezor/suite
// should it be here? clever utility type, something like Parameters<T> ?
export type { RipplePayment } from './api/rippleSignTransaction';
export type { BlockchainEstimateFee } from './api/blockchainEstimateFee';
export type { ComposeOutput, PrecomposedTransaction } from './api/composeTransaction';
export type { SignTransaction } from './api/signTransaction';
export type { EthereumTransaction } from './api/ethereumSignTransaction';
export type { CardanoOutput, CardanoInput, CardanoCertificate } from './api/cardanoSignTransaction';
export type { RecoveryDevice2 as RecoveryDevice } from './api/recoveryDevice';
export type {
    TokenInfo,
    AccountBalanceHistory as BlockchainAccountBalanceHistory,
} from '@trezor/blockchain-link/lib/types/common';

// REF-TODO: this should not be here. Added only for backwards compatibility with
// imports in @trezor/suite
export type TransactionTarget = {
    addresses?: string[];
    isAddress: boolean;
    amount?: string;
    coinbase?: string;
    isAccountTarget?: boolean;
    n: number;
};

// REF-TODO: failed type does not exist in @trezor/blockchain-link anymore
// possibly failed typed is not implemented anymore?
export type AccountTransaction = Omit<Transaction, 'type'> & {
    type: 'sent' | 'recv' | 'self' | 'failed' | 'unknown';
};
