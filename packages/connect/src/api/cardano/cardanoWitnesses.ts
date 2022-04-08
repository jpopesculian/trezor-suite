import type { CertificateWithPoolOwnersAndRelays } from './cardanoCertificate';
import type { CollateralInputWithPath, InputWithPath, Path } from './cardanoInputs';
import {
    CardanoCertificateType,
    //  REF-TODO: rename
    CardanoTxSigningMode as CardanoTxSigningModeEnum,
} from '@trezor/transport/lib/types/messages';
import type {
    CardanoTxSigningMode,
    CardanoTxWithdrawal,
    CardanoTxRequiredSigner,
} from '@trezor/transport/lib/types/messages';

export const gatherWitnessPaths = (
    inputsWithPath: InputWithPath[],
    certificatesWithPoolOwnersAndRelays: CertificateWithPoolOwnersAndRelays[],
    withdrawals: CardanoTxWithdrawal[],
    collateralInputsWithPath: CollateralInputWithPath[],
    requiredSigners: CardanoTxRequiredSigner[],
    additionalWitnessRequests: Path[],
    signingMode: CardanoTxSigningMode,
): Path[] => {
    const witnessPaths = new Map<string, Path>();
    function _insert(path: Path) {
        const pathKey = JSON.stringify(path);
        witnessPaths.set(pathKey, path);
    }

    // don't gather paths from tx elements in MULTISIG_TRANSACTION signing mode
    if (signingMode !== CardanoTxSigningModeEnum.MULTISIG_TRANSACTION) {
        inputsWithPath.forEach(({ path }) => {
            if (path) _insert(path);
        });

        certificatesWithPoolOwnersAndRelays.forEach(({ certificate, poolOwners }) => {
            if (
                certificate.path &&
                (certificate.type === CardanoCertificateType.STAKE_DELEGATION ||
                    certificate.type === CardanoCertificateType.STAKE_DEREGISTRATION)
            ) {
                _insert(certificate.path);
            }
            poolOwners.forEach(poolOwner => {
                if (poolOwner.staking_key_path) _insert(poolOwner.staking_key_path);
            });
        });

        withdrawals.forEach(({ path }) => {
            if (path) _insert(path);
        });
    }

    // gather Plutus-related paths
    if (signingMode === CardanoTxSigningModeEnum.PLUTUS_TRANSACTION) {
        collateralInputsWithPath.forEach(({ path }) => {
            if (path) _insert(path);
        });

        requiredSigners.forEach(({ key_path }) => {
            if (key_path) _insert(key_path);
        });
    }

    // add additional witness requests in all cases (because of minting)
    additionalWitnessRequests.forEach(path => {
        _insert(path);
    });

    return Array.from(witnessPaths.values());
};
