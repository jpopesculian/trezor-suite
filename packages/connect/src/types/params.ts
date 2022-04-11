// API params

export interface CommonParams {
    device?: {
        path: string;
        state?: string;
        instance?: number;
    };
    useEmptyPassphrase?: boolean;
    allowSeedlessDevice?: boolean;
    keepSession?: boolean;
    skipFinalReload?: boolean;
    useCardanoDerivation?: boolean;
}

export type Params<T> = CommonParams & T;

interface Bundle<T> {
    bundle: T[];
}

export type BundledParams<T> = Params<Bundle<T>>;

export type BlockchainParams = {
    coin: string;
};

export interface Unsuccessful {
    success: false;
    payload: { error: string; code?: string };
}

export interface Success<T> {
    success: true;
    id: number; // REF-TODO, this should be a part of CoreMessage, not response
    payload: T;
}

export type Response<T> = Promise<Success<T> | Unsuccessful>;

// Common fields for all *.getAddress methods
export interface GetAddress {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
    useEventListener?: boolean; // this param is set automatically in factory
}

export interface Address {
    address: string;
    path: number[];
    serializedPath: string;
}

// Common fields for all *.getPublicKey methods
export interface GetPublicKey {
    path: string | number[];
    showOnTrezor?: boolean;
}

export interface PublicKey {
    publicKey: string;
    path: number[];
    serializedPath: string;
}
