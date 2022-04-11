/* eslint-disable no-restricted-syntax */

import { AbstractMethod } from '../core/AbstractMethod';
import { validateParams, getFirmwareRange } from './common/paramsValidator';
import { validatePath } from '../utils/pathUtils';
import { getEthereumNetwork } from '../data/CoinInfo';
import { getNetworkLabel } from '../utils/ethereumUtils';
import type {
    MessageResponse,
    EthereumTypedDataStructAck,
} from '@trezor/transport/lib/types/messages';
import { ERRORS } from '../constants';

import type {
    EthereumSignTypedData as EthereumSignTypedDataParams,
    EthereumSignTypedHashAndData as EthereumSignTypedHashAndDataParams,
} from '../types/api/ethereumSignTypedData';
import { getFieldType, parseArrayType, encodeData } from './ethereum/ethereumSignTypedData';
import { messageToHex } from '../utils/formatUtils';

type Params = (
    | Omit<EthereumSignTypedDataParams<any>, 'path'>
    | Omit<EthereumSignTypedHashAndDataParams<any>, 'path'>
) & {
    address_n: number[];
};

// REF-TODO: temporarily here, if we decide to use this, move somewhere else
function isExactMessageResponseType<T extends MessageResponse<any>>(x: any, type: string): x is T {
    return (x as T).type === type;
}

export default class EthereumSignTypedData extends AbstractMethod<'ethereumSignTypedData'> {
    params: Params;

    init() {
        this.requiredPermissions = ['read', 'write'];

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', required: true },
            // model T
            { name: 'metamask_v4_compat', type: 'boolean', required: true },
            { name: 'data', type: 'object', required: true },
            // model One (optional params)
            { name: 'domain_separator_hash', type: 'string' },
            { name: 'message_hash', type: 'string' },
        ]);

        const path = validatePath(payload.path, 3);
        const network = getEthereumNetwork(path);
        this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

        this.info = getNetworkLabel('Sign #NETWORK typed data', network);

        this.params = {
            address_n: path,
            metamask_v4_compat: payload.metamask_v4_compat,
            data: payload.data,
        };

        if ('domain_separator_hash' in payload) {
            this.params = {
                ...this.params,
                // leading `0x` in hash-strings causes issues
                domain_separator_hash: messageToHex(payload.domain_separator_hash),
            };

            if (payload.message_hash) {
                this.params = {
                    ...this.params,
                    // leading `0x` in hash-strings causes issues
                    message_hash: messageToHex(payload.message_hash),
                };
            } else if (this.params.data.primaryType !== 'EIP712Domain') {
                throw ERRORS.TypedError(
                    'Method_InvalidParameter',
                    'message_hash should only be empty when data.primaryType=EIP712Domain',
                );
            }
        }

        if (this.params.data.primaryType === 'EIP712Domain') {
            // Only newer firmwares support this feature
            // Older firmwares will give wrong results / throw errors
            this.firmwareRange = getFirmwareRange(
                'eip712-domain-only',
                network,
                this.firmwareRange,
            );

            if ('message_hash' in this.params) {
                throw ERRORS.TypedError(
                    'Method_InvalidParameter',
                    'message_hash should be empty when data.primaryType=EIP712Domain',
                );
            }
        }
    }

    async run() {
        const cmd = this.device.getCommands();
        const { address_n } = this.params;

        if (this.device.features.model === '1') {
            validateParams(this.params, [
                { name: 'domain_separator_hash', type: 'string', required: true },
                { name: 'message_hash', type: 'string' },
            ]);

            // REF-TODO:
            const { domain_separator_hash, message_hash } = this
                .params as unknown as EthereumSignTypedHashAndDataParams<any>;

            // For Model 1 we use EthereumSignTypedHash
            const response = await cmd.typedCall(
                'EthereumSignTypedHash',
                'EthereumTypedDataSignature',
                {
                    address_n,
                    domain_separator_hash,
                    message_hash,
                },
            );

            const { address, signature } = response.message;
            return {
                address,
                signature: `0x${signature}`,
            };
        }

        const { data, metamask_v4_compat } = this.params;
        const { types, primaryType, domain, message } = data;

        // For Model T we use EthereumSignTypedData
        // REF-TODO: typedCall unions
        // @ts-expect-error
        let response: MessageResponse<
            | 'EthereumTypedDataStructRequest'
            | 'EthereumTypedDataValueRequest'
            | 'EthereumTypedDataSignature'
        > = await cmd.typedCall(
            'EthereumSignTypedData',
            // REF-TODO: typedCall unions
            // @ts-expect-error
            'EthereumTypedDataStructRequest|EthereumTypedDataValueRequest|EthereumTypedDataSignature',
            {
                address_n,
                primary_type: primaryType,
                metamask_v4_compat,
            },
        );

        // sending all the type data
        while (
            // REF-TODO: check if correct, maybe we could find a better approach
            isExactMessageResponseType<MessageResponse<'EthereumTypedDataStructRequest'>>(
                response,
                'EthereumTypedDataStructRequest',
            )
        ) {
            const { name: typeDefinitionName } = response.message;
            const typeDefinition = types[typeDefinitionName];
            if (typeDefinition === undefined) {
                throw ERRORS.TypedError(
                    'Runtime',
                    `Type ${typeDefinitionName} was not defined in types object`,
                );
            }
            const dataStruckAck: EthereumTypedDataStructAck = {
                // REF-TODO: remove any
                members: typeDefinition.map(
                    ({ name, type: typeName }: { name: any; type: any }) => ({
                        name,
                        type: getFieldType(typeName, types),
                    }),
                ),
            };
            // REF-TODO: typedCall unions
            // @ts-expect-error
            response = await cmd.typedCall(
                'EthereumTypedDataStructAck',
                // REF-TODO: typedCall unions
                // @ts-expect-error
                'EthereumTypedDataStructRequest|EthereumTypedDataValueRequest|EthereumTypedDataSignature',
                dataStruckAck,
            );
        }

        // sending the whole message to be signed
        while (
            // REF-TODO: check if correct, maybe we could find a better approach
            isExactMessageResponseType<MessageResponse<'EthereumTypedDataValueRequest'>>(
                response,
                'EthereumTypedDataValueRequest',
            )
        ) {
            const { member_path } = response.message;

            let memberData;
            let memberTypeName;

            const [rootIndex, ...nestedMemberPath] = member_path;
            switch (rootIndex) {
                case 0:
                    memberData = domain;
                    memberTypeName = 'EIP712Domain';
                    break;
                case 1:
                    memberData = message;
                    memberTypeName = primaryType;
                    break;
                default:
                    throw ERRORS.TypedError('Runtime', 'Root index can only be 0 or 1');
            }

            // It can be asking for a nested structure (the member path being [X, Y, Z, ...])
            for (const index of nestedMemberPath) {
                if (Array.isArray(memberData)) {
                    memberTypeName = parseArrayType(memberTypeName).entryTypeName;
                    memberData = memberData[index];
                } else if (typeof memberData === 'object' && memberData !== null) {
                    const memberTypeDefinition = types[memberTypeName][index];
                    memberTypeName = memberTypeDefinition.type;
                    memberData = memberData[memberTypeDefinition.name];
                } else {
                    // TODO: what to do when the value is missing (for example in recursive types)?
                }
            }

            let encodedData;
            // If we were asked for a list, first sending its length and we will be receiving
            // requests for individual elements later
            if (Array.isArray(memberData)) {
                // Sending the length as uint16
                encodedData = encodeData('uint16', memberData.length);
            } else {
                encodedData = encodeData(memberTypeName, memberData);
            }

            // REF-TODO: typedCall unions
            // @ts-expect-error
            response = await cmd.typedCall(
                'EthereumTypedDataValueAck',
                // REF-TODO: typedCall unions
                // @ts-expect-error
                'EthereumTypedDataValueRequest|EthereumTypedDataSignature',
                {
                    value: encodedData,
                },
            );
        }

        const { address, signature } =
            // REF-TODO typecast is safe here, remaining types were handled above
            // additional isExactMessageResponseType check might be added
            response.message as MessageResponse<'EthereumTypedDataSignature'>['message'];
        return {
            address,
            signature: `0x${signature}`,
        };
    }
}
