import {
    addressParametersToProto,
    modifyAddressParametersForBackwardsCompatibility,
    validateAddressParameters,
} from './cardanoAddressParameters';
import { validateParams } from '../common/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import type { IDevice } from '../../device/Device';

import type {
    CardanoTxAuxiliaryData,
    CardanoCatalystRegistrationParametersType,
} from '@trezor/transport/lib/types/messages';
import type {
    CardanoAuxiliaryData,
    CardanoCatalystRegistrationParameters,
} from '../../types/api/cardanoSignTransaction';

const transformCatalystRegistrationParameters = (
    catalystRegistrationParameters: CardanoCatalystRegistrationParameters,
): CardanoCatalystRegistrationParametersType => {
    validateParams(catalystRegistrationParameters, [
        { name: 'votingPublicKey', type: 'string', required: true },
        { name: 'stakingPath', required: true },
        { name: 'nonce', type: 'uint', required: true },
    ]);
    validateAddressParameters(catalystRegistrationParameters.rewardAddressParameters);

    return {
        voting_public_key: catalystRegistrationParameters.votingPublicKey,
        staking_path: validatePath(catalystRegistrationParameters.stakingPath, 3),
        reward_address_parameters: addressParametersToProto(
            catalystRegistrationParameters.rewardAddressParameters,
        ),
        nonce: catalystRegistrationParameters.nonce,
    };
};

export const transformAuxiliaryData = (
    auxiliaryData: CardanoAuxiliaryData,
): CardanoTxAuxiliaryData => {
    validateParams(auxiliaryData, [
        {
            name: 'hash',
            type: 'string',
        },
    ]);

    let catalystRegistrationParameters;
    if (auxiliaryData.catalystRegistrationParameters) {
        catalystRegistrationParameters = transformCatalystRegistrationParameters(
            auxiliaryData.catalystRegistrationParameters,
        );
    }

    return {
        hash: auxiliaryData.hash,
        catalyst_registration_parameters: catalystRegistrationParameters,
    };
};

export const modifyAuxiliaryDataForBackwardsCompatibility = (
    device: IDevice,
    auxiliary_data: CardanoTxAuxiliaryData,
): CardanoTxAuxiliaryData => {
    const { catalyst_registration_parameters } = auxiliary_data;
    if (catalyst_registration_parameters) {
        catalyst_registration_parameters.reward_address_parameters =
            modifyAddressParametersForBackwardsCompatibility(
                device,
                catalyst_registration_parameters.reward_address_parameters,
            );

        return {
            ...auxiliary_data,
            catalyst_registration_parameters,
        };
    }

    return auxiliary_data;
};
