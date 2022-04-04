import React, { memo } from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from '@suite-constants/routes';

import Index from '@suite/views/dashboard';
import Notification from '@suite-views/notifications';

import Wallet from '@wallet-views/transactions';
import WalletReceive from '@wallet-views/receive';
import WalletDetails from '@wallet-views/details';
import WalletTokens from '@wallet-views/tokens';
import WalletSend from '@wallet-views/send';
import WalletStaking from '@wallet-views/staking';
import WalletSignVerify from '@wallet-views/sign-verify';

import WalletCoinmarketBuy from '@wallet-views/coinmarket/buy';
import WalletCoinmarketBuyDetail from '@wallet-views/coinmarket/buy/detail';
import WalletCoinmarketBuyOffers from '@wallet-views/coinmarket/buy/offers';
import WalletCoinmarketSell from '@wallet-views/coinmarket/sell';
import WalletCoinmarketSellDetail from '@wallet-views/coinmarket/sell/detail';
import WalletCoinmarketSellOffers from '@wallet-views/coinmarket/sell/offers';
import WalletCoinmarketExchange from '@wallet-views/coinmarket/exchange';
import WalletCoinmarketExchangeDetail from '@wallet-views/coinmarket/exchange/detail';
import WalletCoinmarketExchangeOffers from '@wallet-views/coinmarket/exchange/offers';
import WalletCoinmarketSpend from '@wallet-views/coinmarket/spend';
import WalletCoinmarketSavings from '@wallet-views/coinmarket/savings';
import WalletCoinmarketSavingsUnsupportedCountry from '@wallet-views/coinmarket/savings/unsupported-country';
import WalletCoinmarketSavingsSetup from '@wallet-views/coinmarket/savings/setup';
import WalletCoinmarketSavingsPaymentInfo from '@wallet-views/coinmarket/savings/payment-info';
import WalletCoinmarketSavingsOverview from '@wallet-views/coinmarket/savings/overview';
import WalletInvityBankAccount from '@wallet-views/invity/bank-account';
import WalletInvityLogin from '@wallet-views/invity/login';
import WalletInvityRecovery from '@wallet-views/invity/recovery';
import WalletInvityRecoverySent from '@wallet-views/invity/recovery-sent';
import WalletInvityRecoverySettings from '@wallet-views/invity/settings';
import WalletInvityRegistration from '@wallet-views/invity/registration';
import WalletInvityRegistrationSuccessful from '@wallet-views/invity/registration-successful';
import WalletInvityAccountVerified from '@wallet-views/invity/account-verified';
import WalletInvityUserInfo from '@wallet-views/invity/user-info';
import WalletInvityPhoneNumberVerification from '@wallet-views/invity/phone-number-verification';
import WalletInvityKYCStart from '@wallet-views/invity/kyc-start';
import WalletInvityKYCFailed from '@wallet-views/invity/kyc-failed';
import WalletInvityAML from '@wallet-views/invity/aml';
import WalletInvitySettingsSuccessful from '@wallet-views/invity/settings-successful';
import WalletCoinmarketRedirect from '@wallet-views/coinmarket/redirect';

import { SettingsGeneral } from '@settings-views/general/SettingsGeneral';
import { SettingsCoins } from '@settings-views/coins/SettingsCoins';
import { SettingsDebug } from '@settings-views/debug/SettingsDebug';
import { SettingsDevice } from '@settings-views/device/SettingsDevice';

const components: { [key: string]: React.ComponentType<any> } = {
    'suite-index': Index,
    'notifications-index': Notification,

    'wallet-index': Wallet,
    'wallet-receive': WalletReceive,
    'wallet-details': WalletDetails,
    'wallet-tokens': WalletTokens,
    'wallet-send': WalletSend,
    'wallet-staking': WalletStaking,
    'wallet-sign-verify': WalletSignVerify,

    'wallet-coinmarket-buy': WalletCoinmarketBuy,
    'wallet-coinmarket-buy-detail': WalletCoinmarketBuyDetail,
    'wallet-coinmarket-buy-offers': WalletCoinmarketBuyOffers,
    'wallet-coinmarket-sell': WalletCoinmarketSell,
    'wallet-coinmarket-sell-detail': WalletCoinmarketSellDetail,
    'wallet-coinmarket-sell-offers': WalletCoinmarketSellOffers,
    'wallet-coinmarket-exchange': WalletCoinmarketExchange,
    'wallet-coinmarket-exchange-detail': WalletCoinmarketExchangeDetail,
    'wallet-coinmarket-exchange-offers': WalletCoinmarketExchangeOffers,
    'wallet-coinmarket-spend': WalletCoinmarketSpend,
    'wallet-coinmarket-savings': WalletCoinmarketSavings,
    'wallet-coinmarket-savings-unsupported-country': WalletCoinmarketSavingsUnsupportedCountry,
    'wallet-coinmarket-savings-setup': WalletCoinmarketSavingsSetup,
    'wallet-coinmarket-savings-payment-info': WalletCoinmarketSavingsPaymentInfo,
    'wallet-coinmarket-savings-overview': WalletCoinmarketSavingsOverview,
    'wallet-invity-bank-account': WalletInvityBankAccount,
    'wallet-invity-login': WalletInvityLogin,
    'wallet-invity-recovery': WalletInvityRecovery,
    'wallet-invity-recovery-sent': WalletInvityRecoverySent,
    'wallet-invity-settings': WalletInvityRecoverySettings,
    'wallet-invity-registration': WalletInvityRegistration,
    'wallet-invity-registration-successful': WalletInvityRegistrationSuccessful,
    'wallet-invity-account-verified': WalletInvityAccountVerified,
    'wallet-invity-user-info': WalletInvityUserInfo,
    'wallet-invity-phone-number-verification': WalletInvityPhoneNumberVerification,
    'wallet-invity-kyc-start': WalletInvityKYCStart,
    'wallet-invity-kyc-failed': WalletInvityKYCFailed,
    'wallet-invity-aml': WalletInvityAML,
    'wallet-invity-settings-successful': WalletInvitySettingsSuccessful,
    'wallet-coinmarket-redirect': WalletCoinmarketRedirect,

    'settings-index': SettingsGeneral,
    'settings-coins': SettingsCoins,
    'settings-debug': SettingsDebug,
    'settings-device': SettingsDevice,
};

const AppRouter = () => (
    <Switch>
        {routes.map(route => (
            <Route
                key={route.name}
                path={process.env.ASSET_PREFIX + route.pattern}
                exact={route.exact}
                component={components[route.name]}
            />
        ))}
    </Switch>
);

export default memo(AppRouter);
