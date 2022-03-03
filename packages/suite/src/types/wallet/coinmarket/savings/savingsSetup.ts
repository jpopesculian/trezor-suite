import type { PaymentFrequency } from '@suite-services/invityAPI';
import type { WithSelectedAccountLoadedProps } from '@wallet-components';
import type { TypedValidationRules } from '@wallet-types/form';
import type { UseFormMethods } from 'react-hook-form';
import type { Account } from '@wallet-types';
import type { Option } from '@wallet-types/coinmarketCommonTypes';

export type UseSavingsSetupProps = WithSelectedAccountLoadedProps;

export interface SavingsSetupFormState {
    paymentFrequency: PaymentFrequency;
    fiatAmount: string;
    customFiatAmount: string;
    address?: string;
}

export type SavingsSetupContextValues = Omit<UseFormMethods<SavingsSetupFormState>, 'register'> & {
    register: (rules?: TypedValidationRules) => (ref: any) => void; // TODO: ReturnType of UseFormMethods['register'] union
    onSubmit: (data: SavingsSetupFormState) => void;
    defaultPaymentFrequency?: PaymentFrequency;
    defaultFiatAmount?: string;
    annualSavingsCalculationFiat: number;
    annualSavingsCalculationCrypto: string;
    fiatAmount?: string;
    fiatCurrency?: string;
    isWatchingKYCStatus: boolean;
    canConfirmSetup: boolean;
    account: Account;
    address?: string;
    isSubmitting: boolean;
    paymentFrequencyOptions: Option[];
    paymentAmounts: string[];
    minimumPaymentAmountLimit?: number;
    maximumPaymentAmountLimit?: number;
};
