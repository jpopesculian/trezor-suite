import React from 'react';
import styled from 'styled-components';
import { resolveStaticPath } from '@suite-utils/build';
import { Loader } from '@trezor/components';
import { useSelector } from '@suite-hooks';
import { ExtendedMessageDescriptor } from '@suite-types';
import { Translation } from '@suite-components';

interface SavingsSetupGuideListItemProps {
    isEnabled: boolean;
    isBulletPointHidden: boolean;
}

const Wrapper = styled.div`
    width: 221px;
    background: rgba(196, 196, 196, 0.1);
    height: 100%;
    border-radius: 12px 0 0 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
`;

const SavingsSetupGuideList = styled.ol`
    font-size: 16px;
    line-height: 24px;
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    list-style-position: inside;
    counter-reset: item;
    list-style-type: none;
    margin: 15px 15px;
`;

const SavingsSetupGuideListItem = styled.li<SavingsSetupGuideListItemProps>`
    width: 100%;
    height: 46px;
    padding: 12px 0 10px 15px;
    display: flex;
    align-items: center;
    &::before {
        display: block;
        visibility: ${props => (props.isBulletPointHidden ? 'hidden' : 'visible')};
        width: ${props => (props.isBulletPointHidden ? '0' : '20px')};
        color: ${props => props.theme.TYPE_LIGHT_GREY};
        opacity: 0.5;
        counter-increment: item;
        content: counter(item);
        text-align: left;
        margin-right: ${props => (props.isBulletPointHidden ? '0' : '4px')};
    }

    &:not(&.isSelected ~ &):not(&.isSelected) {
        &::before {
            line-height: 28px;
            height: 23px;
            margin-left: ${props => (props.isBulletPointHidden ? '0' : '-4px')};
            margin-right: ${props => (props.isBulletPointHidden ? '0' : '8px')};
            content: url(${resolveStaticPath('images/svg/check.svg')});
        }
    }

    &.isSelected {
        background: ${props => props.theme.BG_WHITE};
        box-shadow: 0px 1px 12px rgba(0, 0, 0, 0.05);
        border-radius: 10px;
        color: ${props => props.theme.TYPE_GREEN};
    }
`;

const StyledLoader = styled(Loader)`
    margin-left: -4px;
    margin-right: 8px;
    width: 20px;
`;

const ProvidedBy = styled.div`
    margin-left: 24px;
    margin-bottom: 20px;
    font-size: 12px;
    line-height: 24px;
    color: ${props => props.theme.TYPE_LIGHT_GREY};
    font-weight: 400;
`;

const ProviderName = styled.span`
    font-weight: 600;
`;

const SavingsSteps = () => {
    const { isWatchingKYCStatus, selectedProvider, currentRouteName } = useSelector(state => ({
        isWatchingKYCStatus: state.wallet.coinmarket.savings.isWatchingKYCStatus,
        selectedProvider: state.wallet.coinmarket.savings.selectedProvider,
        currentRouteName: state.router.route?.name,
    }));

    if (!currentRouteName) {
        return null;
    }

    const steps = {
        TR_SAVINGS_GUIDE_STEP_YOUR_CREDENTIALS: {
            isEnabled: selectedProvider?.flow.credentials.isEnabled,
            isBulletPointHidden: false,
            className: [
                'wallet-invity-registration',
                'wallet-invity-user-info',
                'wallet-invity-registration-successful',
            ].includes(currentRouteName)
                ? 'isSelected'
                : '',
        },
        TR_SAVINGS_GUIDE_STEP_YOUR_PHONE_NUMBER: {
            isEnabled: selectedProvider?.flow.phoneVerification.isEnabled,
            isBulletPointHidden: false,
            className:
                currentRouteName === 'wallet-invity-phone-number-verification' ? 'isSelected' : '',
        },
        TR_SAVINGS_GUIDE_STEP_KYC_VERIFICATION: {
            isEnabled: selectedProvider?.flow.kyc.isEnabled,
            isBulletPointHidden: isWatchingKYCStatus,
            className: ['wallet-invity-kyc-start', 'wallet-invity-kyc-failed'].includes(
                currentRouteName,
            )
                ? 'isSelected'
                : '',
        },
        TR_SAVINGS_GUIDE_STEP_AML: {
            isEnabled: selectedProvider?.flow.aml.isEnabled,
            isBulletPointHidden: false,
            className: currentRouteName === 'wallet-invity-aml' ? 'isSelected' : '',
        },
        TR_SAVINGS_GUIDE_STEP_BANK_ACCOUNT: {
            isEnabled: selectedProvider?.flow.bankAccount.isEnabled,
            isBulletPointHidden: false,
            className: currentRouteName === 'wallet-invity-bank-account' ? 'isSelected' : '',
        },
        TR_SAVINGS_GUIDE_STEP_DCA_SETUP: {
            isEnabled: selectedProvider?.flow.parameters.isEnabled,
            isBulletPointHidden: false,
            className: [
                'wallet-coinmarket-savings-setup',
                'wallet-coinmarket-savings-payment-info',
            ].includes(currentRouteName)
                ? 'isSelected'
                : '',
        },
    } as Record<string, SavingsSetupGuideListItemProps>;

    const showProviderName =
        !!selectedProvider?.companyName &&
        [
            'wallet-invity-kyc-start',
            'wallet-invity-kyc-failed',
            'wallet-invity-aml',
            'wallet-invity-bank-account',
            'wallet-coinmarket-savings-setup',
            'wallet-coinmarket-savings-payment-info',
        ].includes(currentRouteName);

    return (
        <Wrapper>
            <SavingsSetupGuideList>
                {Object.entries(steps)
                    .filter(([, value]) => value.isEnabled)
                    .map(([key, value]) => (
                        <SavingsSetupGuideListItem key={key} {...value}>
                            {value.isBulletPointHidden && <StyledLoader size={16} />}
                            <Translation id={key as ExtendedMessageDescriptor['id']} />
                        </SavingsSetupGuideListItem>
                    ))}
            </SavingsSetupGuideList>
            {showProviderName && (
                <ProvidedBy>
                    <Translation
                        id="TR_SAVINGS_GUIDE_PROVIDED_BY"
                        values={{
                            providerName: (
                                <ProviderName>{selectedProvider.companyName}</ProviderName>
                            ),
                        }}
                    />
                </ProvidedBy>
            )}
        </Wrapper>
    );
};

export default SavingsSteps;
