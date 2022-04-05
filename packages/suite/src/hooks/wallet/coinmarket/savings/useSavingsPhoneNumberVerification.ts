import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    SavingsPhoneNumberVerificationFieldValues,
    SavingsPhoneNumberVerificationContextValues,
    UseSavingsPhoneNumberVerificationProps,
} from '@wallet-types/coinmarket/savings/phoneNumberVerification';
import { useForm } from 'react-hook-form';
import invityAPI from '@suite-services/invityAPI';
import { useInvityNavigation } from '@wallet-hooks/useInvityNavigation';
import * as coinmarketCommonActions from '@wallet-actions/coinmarket/coinmarketCommonActions';
import * as coinmarketSavingsActions from '@wallet-actions/coinmarketSavingsActions';
import { useActions, useSelector } from '@suite-hooks';
import { useEffectOnce } from 'react-use';

export const SavingsPhoneNumberVerificationContext =
    createContext<SavingsPhoneNumberVerificationContextValues | null>(null);
SavingsPhoneNumberVerificationContext.displayName = 'SavingsPhoneNumberVerificationContext';

export const useSavingsPhoneNumberVerification = ({
    selectedAccount,
}: UseSavingsPhoneNumberVerificationProps): SavingsPhoneNumberVerificationContextValues => {
    const { phoneNumberPrefix, phoneNumber, verificationCodeExpiration } = useSelector(state => ({
        phoneNumberPrefix:
            state.wallet.coinmarket.invityAuthentication?.accountInfo?.settings?.phoneNumberPrefix,
        phoneNumber:
            state.wallet.coinmarket.invityAuthentication?.accountInfo?.settings?.phoneNumber,
        verificationCodeExpiration: state.wallet.coinmarket.savings.verificationCodeExpiration,
    }));
    const { loadInvityData, setVerificationCodeExpiration } = useActions({
        loadInvityData: coinmarketCommonActions.loadInvityData,
        setVerificationCodeExpiration: coinmarketSavingsActions.setVerificationCodeExpiration,
    });
    useEffect(() => {
        loadInvityData();
    }, [loadInvityData]);

    const { navigateToInvityKYCStart, navigateToInvityUserInfo } = useInvityNavigation(
        selectedAccount.account,
    );
    const methods = useForm<SavingsPhoneNumberVerificationFieldValues>({
        mode: 'onChange',
    });
    const { register, setError, clearErrors, reset, errors } = methods;

    const onSubmit = async (fieldValues: SavingsPhoneNumberVerificationFieldValues) => {
        clearErrors();
        const code = Object.values(fieldValues).join('');
        const response = await invityAPI.verifySmsCode(code, `${phoneNumberPrefix}${phoneNumber}`);
        if (response) {
            if (response.status === 'Verified') {
                navigateToInvityKYCStart();
                return;
            }
            if (response.status === 'VerificationCodeInvalid') {
                setError('codeDigitIndex0', {
                    message: 'TR_SAVINGS_PHONE_NUMBER_VERIFICATION_CODE_IS_INVALID',
                });
                reset(fieldValues, {
                    errors: true,
                });
            }
        } else {
            setError('codeDigitIndex0', {
                message: 'TR_SAVINGS_PHONE_NUMBER_VERIFICATION_CODE_ERROR',
            });
            reset(fieldValues, {
                errors: true,
            });
        }
    };

    const typedRegister = useCallback(<T>(rules?: T) => register(rules), [register]);
    const error = Object.values(errors).find(error => error.message);
    const handlePhoneNumberChange = useCallback(() => {
        navigateToInvityUserInfo();
    }, [navigateToInvityUserInfo]);

    const timeoutId = useRef<number>(0);
    const startCountdown = useCallback(
        (verificationCodeExpiresInSecondsEffective: number) => {
            timeoutId.current = window.setTimeout(() => {
                if (verificationCodeExpiresInSecondsEffective > 0) {
                    setVerificationCodeExpiration(
                        verificationCodeExpiresInSecondsEffective - 1,
                        timeoutId.current,
                    );
                    startCountdown(verificationCodeExpiresInSecondsEffective - 1);
                }
            }, 1000);
        },
        [setVerificationCodeExpiration],
    );

    const [isSending, setIsSending] = useState(false);
    const sendVerificationSms = useCallback(async () => {
        setIsSending(true);
        const sendVerificationSmsResponse = await invityAPI.sendVerificationSms();
        if (sendVerificationSmsResponse?.status === 'SmsQueued') {
            setVerificationCodeExpiration(
                sendVerificationSmsResponse.verificationCodeExpirationInSeconds,
            );
            startCountdown(sendVerificationSmsResponse.verificationCodeExpirationInSeconds);
            reset();
        } else {
            setError('codeDigitIndex0', {
                message: 'TR_SAVINGS_PHONE_NUMBER_VERIFICATION_CODE_ERROR',
            });
        }
        setIsSending(false);
    }, [reset, setError, setVerificationCodeExpiration, startCountdown]);

    const hasVerificationCodeExpired = verificationCodeExpiration.expiresInSeconds === 0;

    useEffectOnce(() => {
        if (verificationCodeExpiration.timeoutId) {
            window.clearTimeout(verificationCodeExpiration.timeoutId);
        }
        if (!hasVerificationCodeExpired) {
            startCountdown(verificationCodeExpiration.expiresInSeconds);
        } else if (!isSending && hasVerificationCodeExpired) {
            sendVerificationSms();
        }
    });

    const handleResendVerificationSmsButtonClick = useCallback(async () => {
        await sendVerificationSms();
    }, [sendVerificationSms]);

    return {
        ...methods,
        register: typedRegister,
        error,
        onSubmit,
        phoneNumber: `${phoneNumberPrefix} ${phoneNumber}`,
        handlePhoneNumberChange,
        verificationCodeExpirationCountdownSeconds: verificationCodeExpiration.expiresInSeconds,
        hasVerificationCodeExpired,
        handleResendVerificationSmsButtonClick,
        isResending: isSending,
    };
};

export const useSavingsPhoneNumberVerificationContext = () => {
    const context = useContext(SavingsPhoneNumberVerificationContext);
    if (context === null) throw Error('SavingsPhoneNumberVerificationContext used without Context');
    return context;
};
