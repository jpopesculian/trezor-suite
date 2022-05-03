import React from 'react';
import { useRecovery } from '@suite-hooks';
import TrezorConnect, { UI, BIP_39 } from '@trezor/connect';
import { WordInput, WordInputAdvanced } from '@suite-components';

const options = BIP_39.map(item => ({ label: item, value: item }));

// todo: feels like duplicated files
// trezor-suite/packages/suite/src/components/recovery/SelectRecoveryWord.tsx
// trezor-suite/packages/suite/src/components/suite/modals/Word/index.tsx
const RecoveryWordSelect = () => {
    const { wordRequestInputType } = useRecovery();

    if (wordRequestInputType === 6 || wordRequestInputType === 9) {
        return (
            <WordInputAdvanced
                count={wordRequestInputType}
                onSubmit={value =>
                    TrezorConnect.uiResponse({ type: UI.RECEIVE_WORD, payload: value })
                }
            />
        );
    }

    if (wordRequestInputType === 'plain') {
        return (
            <WordInput
                options={options}
                onSubmit={value => {
                    TrezorConnect.uiResponse({ type: UI.RECEIVE_WORD, payload: value });
                }}
            />
        );
    }

    return null;
};

export default RecoveryWordSelect;
