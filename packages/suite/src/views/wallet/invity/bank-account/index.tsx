import * as React from 'react';
import styled from 'styled-components';
import { Translation } from '@suite-components';
import { Button, Input } from '@trezor/components';
import {
    InputError,
    KYCInProgress,
    withInvityLayout,
    WithInvityLayoutProps,
} from '@wallet-components';
import { getInputState } from '@wallet-views/coinmarket';
import { useBankAccount } from '@wallet-hooks/coinmarket/savings/useBankAccount';

const Header = styled.div`
    font-size: 24px;
    line-height: 24px;
    margin-bottom: 31px;
`;

const BankAccount = (props: WithInvityLayoutProps) => {
    const { register, errors, getValues, onSubmit, handleSubmit, formState, isWatchingKYCStatus } =
        useBankAccount(props);

    const routingNumberInputName = 'routingNumber';
    const accountNumberInputName = 'accountNumber';
    const { isSubmitting } = formState;
    const { routingNumber, accountNumber } = getValues();
    const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;
    return (
        <>
            {isWatchingKYCStatus && <KYCInProgress />}
            <Header>
                <Translation id="TR_SAVINGS_BANK_ACCOUNT_HEADER" />
            </Header>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                    label={<Translation id="TR_SAVINGS_BANK_ACCOUNT_ROUTING_NUMBER_LABEL" />}
                    name={routingNumberInputName}
                    // TODO: maxLength={255}
                    state={getInputState(errors.routingNumber, routingNumber)}
                    innerRef={register({
                        required: 'TR_SAVINGS_BANK_ACCOUNT_ROUTING_NUMBER_REQUIRED',
                    })}
                    bottomText={<InputError error={errors[routingNumberInputName]} />}
                />
                <Input
                    label={<Translation id="TR_SAVINGS_BANK_ACCOUNT_ACCOUNT_NUMBER_LABEL" />}
                    name={accountNumberInputName}
                    // TODO: maxLength={255}
                    state={getInputState(errors.accountNumber, accountNumber)}
                    innerRef={register({
                        required: 'TR_SAVINGS_BANK_ACCOUNT_ACCOUNT_NUMBER_REQUIRED',
                    })}
                    bottomText={<InputError error={errors[accountNumberInputName]} />}
                />
                <Button isDisabled={!canSubmit} isLoading={isSubmitting}>
                    <Translation id="TR_CONFIRM" />
                </Button>
            </form>
        </>
    );
};

export default withInvityLayout(BankAccount, {
    showStepsGuide: true,
});
