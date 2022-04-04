import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import {
    SavingsBankAccountContextValues,
    UseSavingsBankAccountProps,
    SavingsBankAccountFormState,
} from '@wallet-types/coinmarket/savings/bankAccount';
import { useSelector } from '@suite-hooks/useSelector';

export const useBankAccount = ({
    selectedAccount,
}: UseSavingsBankAccountProps): SavingsBankAccountContextValues => {
    console.log({ selectedAccount });
    const { isWatchingKYCStatus } = useSelector(state => ({
        isWatchingKYCStatus: state.wallet.coinmarket.savings.isWatchingKYCStatus,
    }));
    const methods = useForm<SavingsBankAccountFormState>({
        mode: 'onChange',
    });

    const { register } = methods;

    const onSubmit = ({ accountNumber, routingNumber }: SavingsBankAccountFormState) => {
        console.log({ accountNumber });
        console.log({ routingNumber });
    };

    // TODO: extract
    const typedRegister = useCallback(<T>(rules?: T) => register(rules), [register]);

    return {
        ...methods,
        register: typedRegister,
        onSubmit,
        isWatchingKYCStatus,
    };
};
