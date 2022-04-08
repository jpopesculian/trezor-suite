// import * as Methods from '../api';
// import { ERRORS } from '../constants';
// import { MethodCallMessage } from '../events';
// @ts-ignore REF-TODO
import { find } from 'trezor-connect/lib/core/methods';

// type Map = {
//     // [K in keyof typeof Methods]: AbstractMethod<K>;
//     [K in CallMethodPayload['method']]: AbstractMethod<K>;
// };

// type Payload<M> = Extract<CallMethodPayload, { method: M }>;
// REF-TODO abscract method costructor params
// export const getMethod = (message: MethodCallMessage & { id?: number }) => {
//     const { method } = message.payload;
//     if (typeof method !== 'string') {
//         throw ERRORS.TypedError('Method_InvalidParameter', 'Message method is not set');
//     }

//     const MethodConstructor = Methods[method];
//     if (MethodConstructor) {
//         return new MethodConstructor(message as any); // REF-TODO
//     }

//     throw ERRORS.TypedError('Method_InvalidParameter', `Method ${method} not found`);
// };

export const getMethod = find;
