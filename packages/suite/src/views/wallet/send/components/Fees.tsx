import React from 'react';
import styled from 'styled-components';
import { variables } from '@trezor/components';

import { Card } from '@suite-components';
import Fees from '@wallet-components/Fees';
import { useSendFormContext } from '@wallet-hooks';

const StyledCard = styled(Card)`
    display: flex;
    margin-bottom: 8px;
    padding: 32px 42px;

    @media (max-width: ${variables.SCREEN_SIZE.SM}) {
        padding: 32px 20px;
    }
`;

// wrapper for shareable Fees component
export const SendFees = () => {
    const {
        errors,
        register,
        setValue,
        getValues,
        changeFeeLevel,
        account,
        feeInfo,
        composedLevels,
    } = useSendFormContext();

    return (
        <StyledCard>
            <Fees
                errors={errors}
                register={register}
                feeInfo={feeInfo}
                setValue={setValue}
                getValues={getValues}
                account={account}
                composedLevels={composedLevels}
                changeFeeLevel={changeFeeLevel}
                showLabel
            />
        </StyledCard>
    );
};
