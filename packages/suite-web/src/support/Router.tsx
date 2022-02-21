import React, { lazy, memo, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';

import routes from '@suite-constants/routes';
import { BundleLoader } from '@suite-components';

const components: { [key: string]: React.LazyExoticComponent<any> } = {
    'suite-index': lazy(() => import(/* webpackChunkName: "dashboard" */ '@suite/views/dashboard')),
    'notifications-index': lazy(
        () => import(/* webpackChunkName: "notifications" */ '@suite-views/notifications'),
    ),

    // wallet
    'wallet-index': lazy(
        () => import(/* webpackChunkName: "wallet" */ '@wallet-views/transactions'),
    ),
    'wallet-receive': lazy(() => import(/* webpackChunkName: "wallet" */ '@wallet-views/receive')),
    'wallet-details': lazy(() => import(/* webpackChunkName: "wallet" */ '@wallet-views/details')),
    'wallet-tokens': lazy(() => import(/* webpackChunkName: "wallet" */ '@wallet-views/tokens')),
    'wallet-send': lazy(() => import(/* webpackChunkName: "wallet" */ '@wallet-views/send')),
    'wallet-staking': lazy(() => import(/* webpackChunkName: "wallet" */ '@wallet-views/staking')),
    'wallet-sign-verify': lazy(
        () => import(/* webpackChunkName: "wallet" */ '@wallet-views/sign-verify'),
    ),

    // coinmarket
    'wallet-coinmarket-buy': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/buy'),
    ),
    'wallet-coinmarket-buy-detail': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/buy/detail'),
    ),
    'wallet-coinmarket-buy-offers': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/buy/offers'),
    ),
    'wallet-coinmarket-sell': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/sell'),
    ),
    'wallet-coinmarket-sell-detail': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/sell/detail'),
    ),
    'wallet-coinmarket-sell-offers': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/sell/offers'),
    ),
    'wallet-coinmarket-exchange': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/exchange'),
    ),
    'wallet-coinmarket-exchange-detail': lazy(
        () =>
            import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/exchange/detail'),
    ),
    'wallet-coinmarket-exchange-offers': lazy(
        () =>
            import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/exchange/offers'),
    ),
    'wallet-coinmarket-spend': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/spend'),
    ),
    'wallet-coinmarket-savings': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/savings'),
    ),
    'wallet-coinmarket-savings-unsupported-country': lazy(
        () =>
            import(
                /* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/savings/unsupported-country'
            ),
    ),
    'wallet-coinmarket-savings-setup': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/savings/setup'),
    ),
    'wallet-coinmarket-savings-payment-info': lazy(
        () =>
            import(
                /* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/savings/payment-info'
            ),
    ),
    'wallet-coinmarket-savings-overview': lazy(
        () =>
            import(
                /* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/savings/overview'
            ),
    ),
    'wallet-invity-login': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/login'),
    ),
    'wallet-invity-recovery': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/recovery'),
    ),
    'wallet-invity-recovery-sent': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/recovery-sent'),
    ),
    'wallet-invity-settings': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/settings'),
    ),
    'wallet-invity-registration': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/registration'),
    ),
    'wallet-invity-registration-successful': lazy(
        () =>
            import(
                /* webpackChunkName: "coinmarket" */ '@wallet-views/invity/registration-successful'
            ),
    ),
    'wallet-invity-account-verified': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/account-verified'),
    ),
    'wallet-invity-user-info': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/user-info'),
    ),
    'wallet-invity-phone-number-verification': lazy(
        () =>
            import(
                /* webpackChunkName: "coinmarket" */ '@wallet-views/invity/phone-number-verification'
            ),
    ),
    'wallet-invity-kyc-start': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/kyc-start'),
    ),
    'wallet-invity-kyc-failed': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/kyc-failed'),
    ),
    'wallet-invity-aml': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/invity/aml'),
    ),
    'wallet-coinmarket-redirect': lazy(
        () => import(/* webpackChunkName: "coinmarket" */ '@wallet-views/coinmarket/redirect'),
    ),

    // settings
    'settings-index': lazy(() =>
        import(/* webpackChunkName: "settings" */ '@settings-views/general/SettingsGeneral').then(
            ({ SettingsGeneral }) => ({ default: SettingsGeneral }),
        ),
    ),
    'settings-coins': lazy(() =>
        import(/* webpackChunkName: "settings" */ '@settings-views/coins/SettingsCoins').then(
            ({ SettingsCoins }) => ({ default: SettingsCoins }),
        ),
    ),
    'settings-debug': lazy(() =>
        import(/* webpackChunkName: "settings" */ '@settings-views/debug/SettingsDebug').then(
            ({ SettingsDebug }) => ({ default: SettingsDebug }),
        ),
    ),
    'settings-device': lazy(() =>
        import(/* webpackChunkName: "settings" */ '@settings-views/device/SettingsDevice').then(
            ({ SettingsDevice }) => ({ default: SettingsDevice }),
        ),
    ),
};

const AppRouter = () => (
    <Suspense fallback={<BundleLoader />}>
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
    </Suspense>
);

export default memo(AppRouter);
