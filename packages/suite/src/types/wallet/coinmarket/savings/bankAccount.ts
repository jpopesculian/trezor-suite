import type { WithSelectedAccountLoadedProps } from '@wallet-components';
import type { TypedValidationRules } from '@wallet-types/form';
import type { UseFormMethods } from 'react-hook-form';

export type UseSavingsBankAccountProps = WithSelectedAccountLoadedProps;

export interface SavingsBankAccountFormState {
    routingNumber: string;
    accountNumber: string;
}
export type SavingsBankAccountContextValues = Omit<
    UseFormMethods<SavingsBankAccountFormState>,
    'register'
> & {
    register: (rules?: TypedValidationRules) => (ref: any) => void; // TODO: ReturnType of UseFormMethods['register'] union
    onSubmit: (data: SavingsBankAccountFormState) => void;
    isWatchingKYCStatus: boolean;
};
