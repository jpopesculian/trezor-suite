import type { TrezorConnect } from '../types/api';
import type { CommonParams } from '../types/params';

// https://github.com/microsoft/TypeScript/issues/32164
// there is no native way how to get Parameters<Fn> for overloaded function
// current TrezorConnect api methods have exactly 2 overloads (if any)
type OverloadedMethod<T, E extends Record<string, string>> = T extends {
    (params: infer P1): infer R1;
    (params: infer P2): infer R2;
}
    ? ((params: P1 & E) => R1) | ((params: P2 & E) => R2)
    : never;

type UnwrappedMethod<T, M extends Record<string, string>> = T extends () => infer R
    ? // - method doesn't have params (example: dispose, getSettings)
      (params: M & CommonParams) => R
    : OverloadedMethod<T, M> extends never
    ? // - method in NOT overloaded, one set of params and one set of result (example: signTransaction)
      T extends (...args: infer P) => infer R
        ? (params: M & P[0]) => R
        : never
    : // - method is overloaded, result depends on params (example: getAddress)
      OverloadedMethod<T, M>;

// map TrezorConnect api with unwrapped methods
type UnwrappedApi = {
    [K in keyof TrezorConnect]: UnwrappedMethod<TrezorConnect[K], { method: K }>;
};

type CallMethods = Exclude<
    keyof UnwrappedApi,
    | 'init'
    | 'manifest'
    | 'dispose'
    | 'cancel'
    | 'disableWebUSB'
    | 'renderWebUSBButton'
    | 'on'
    | 'off'
    | 'removeAllListeners'
    | 'uiResponse'
>;
export type CallUnion = UnwrappedApi[CallMethods];
export type CallMessage = Parameters<CallUnion>[0];
export type AnyResponse = ReturnType<CallUnion>;

export type Call = (params: CallMessage) => Promise<any>;
