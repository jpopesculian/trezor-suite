import { createContext, useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type {
    SavingsUserInfoFormState,
    SavingsUserInfoContextValues,
    UseSavingsUserInfoProps,
} from '@wallet-types/coinmarket/savings/userInfo';
import invityAPI from '@suite-services/invityAPI';
import * as coinmarketCommonActions from '@wallet-actions/coinmarket/coinmarketCommonActions';
import * as coinmarketSavingsActions from '@wallet-actions/coinmarketSavingsActions';
import { useActions, useSelector } from '@suite-hooks';
import { useInvityNavigation } from '@wallet-hooks/useInvityNavigation';
import { useFormDraft } from '@wallet-hooks/useFormDraft';
import type { SavingsUnsupportedCountryFormState } from '@suite/types/wallet/coinmarket/savings/unsupportedCountry';
import type { Option } from '@wallet-types/coinmarketCommonTypes';
import regional from '@suite/constants/wallet/coinmarket/regional';

export const SavingsUserInfoContext = createContext<SavingsUserInfoContextValues | null>(null);
SavingsUserInfoContext.displayName = 'SavingsUserInfoContext';

export const useSavingsUserInfo = ({
    selectedAccount,
}: UseSavingsUserInfoProps): SavingsUserInfoContextValues => {
    const { accountSettings, country, selectedProvider } = useSelector(state => ({
        accountSettings: state.wallet.coinmarket.invityAuthentication?.accountInfo?.settings,
        country: state.wallet.coinmarket.savings.savingsInfo?.country,
        selectedProvider: state.wallet.coinmarket.savings.selectedProvider,
    }));
    const {
        navigateToInvityPhoneNumberVerification,
        navigateToInvityKYCStart,
        navigateToInvityBankAccount,
    } = useInvityNavigation(selectedAccount.account);

    const { loadInvityData, startWatchingKYCStatus } = useActions({
        loadInvityData: coinmarketCommonActions.loadInvityData,
        startWatchingKYCStatus: coinmarketSavingsActions.startWatchingKYCStatus,
    });
    useEffect(() => {
        loadInvityData();
    }, [loadInvityData]);

    const { getDraft } = useFormDraft<SavingsUnsupportedCountryFormState>(
        'coinmarket-savings-unsupported-country',
    );
    const unsupportedCountryFormDraft = getDraft(selectedAccount.account.descriptor);
    const selectedCountryCode = unsupportedCountryFormDraft?.country || country;
    const defaultPhoneNumberPrefixCountryOption = regional.countriesPhoneNumberPrefixOptions.find(
        item =>
            (accountSettings?.phoneNumberPrefix &&
                item.label.endsWith(accountSettings?.phoneNumberPrefix)) ||
            item.value === selectedCountryCode,
    );

    const methods = useForm<SavingsUserInfoFormState>({
        mode: 'onChange',
        defaultValues: {
            givenName: accountSettings?.givenName,
            familyName: accountSettings?.familyName,
            phoneNumber: accountSettings?.phoneNumber?.replace(
                regional.getPhoneNumberPrefixByCountryCode(selectedCountryCode) || '',
                '',
            ),
            phoneNumberPrefixCountryOption: defaultPhoneNumberPrefixCountryOption,
        },
    });

    const { register, control, trigger, formState, setError } = methods;
    const { dirtyFields } = formState;
    const isPhoneNumberPrefixCounryDirty = !!dirtyFields.phoneNumberPrefixCountryOption;

    const { phoneNumberPrefixCountryOption } = useWatch<SavingsUserInfoFormState>({
        control,
        defaultValue: {
            phoneNumberPrefixCountryOption: defaultPhoneNumberPrefixCountryOption,
        },
    });

    useEffect(() => {
        if (phoneNumberPrefixCountryOption && isPhoneNumberPrefixCounryDirty) {
            trigger('phoneNumber');
        }
    }, [phoneNumberPrefixCountryOption, trigger, isPhoneNumberPrefixCounryDirty]);

    const onSubmit = async ({
        familyName,
        givenName,
        phoneNumber,
        phoneNumberPrefixCountryOption,
    }: SavingsUserInfoFormState) => {
        if (accountSettings) {
            const phoneNumberPrefix = regional.getPhoneNumberPrefixByCountryCode(
                phoneNumberPrefixCountryOption.value,
            );
            const response = await invityAPI.saveAccountSettings({
                ...accountSettings,
                familyName,
                givenName,
                phoneNumberPrefix,
                // trim all white spaces
                phoneNumber: phoneNumber.replace(/\s+/g, ''),
            });
            if (response && !response.error && selectedProvider) {
                const { flow } = selectedProvider;
                if (flow?.phoneVerification?.isEnabled) {
                    const sendVerificationSmsResponse = await invityAPI.sendVerificationSms();
                    if (sendVerificationSmsResponse?.status === 'SmsQueued') {
                        navigateToInvityPhoneNumberVerification();
                    } else {
                        setError('phoneNumber', {
                            message: 'TR_SAVINGS_GENERAL_ERROR_MESSAGE',
                            types: {},
                        });
                    }
                } else if (flow?.kyc.isEnabled) {
                    if (flow.kyc.documentUploadType === 'External') {
                        await invityAPI.doSavingsTrade(
                            {
                                trade: {
                                    country: selectedCountryCode,
                                    exchange: selectedProvider.name,
                                    cryptoCurrency: selectedAccount.account.symbol,
                                    fiatCurrency: selectedProvider.tradedFiatCurrencies[0],
                                    status: 'KYC',
                                    kycStatus: 'Open',
                                },
                            },
                            '',
                        );
                        startWatchingKYCStatus(selectedProvider.name);
                        navigateToInvityBankAccount();
                    } else {
                        navigateToInvityKYCStart();
                    }
                }
            } else {
                setError('phoneNumber', {
                    message: 'TR_SAVINGS_GENERAL_ERROR_MESSAGE',
                    types: {},
                });
            }
        }
    };

    // TODO: extract
    const typedRegister = useCallback(<T>(rules?: T) => register(rules), [register]);

    return {
        ...methods,
        register: typedRegister,
        onSubmit,
        phoneNumberPrefixCountryOption: phoneNumberPrefixCountryOption as Option,
    };
};
