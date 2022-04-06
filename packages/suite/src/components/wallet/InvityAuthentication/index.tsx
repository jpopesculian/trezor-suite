import React, { useEffect, useState } from 'react';
import { useActions, useSelector } from '@suite-hooks';
import { useEffectOnce } from 'react-use';
import * as notificationActions from '@suite-actions/notificationActions';
import * as coinmarketCommonActions from '@wallet-actions/coinmarket/coinmarketCommonActions';
import * as coinmarketSavingsActions from '@wallet-actions/coinmarketSavingsActions';
import { useInvityNavigation } from '@wallet-hooks/useInvityNavigation';
import type { AppState } from '@suite-types';
import invityAPI from '@suite-services/invityAPI';
import { getPrefixedURL, getRoute } from '@suite-utils/router';
import { submitRequestForm } from '@suite-utils/env';

export interface InvityAuthenticationContextProps {
    iframeMessage?: IframeMessage;
}

export const InvityAuthenticationContext = React.createContext<InvityAuthenticationContextProps>(
    {},
);

const inIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

interface IframeMessage {
    name: 'invity-authentication';
    action?:
        | 'loading'
        | 'loaded'
        | 'resize'
        | 'registration-successful'
        | 'login-successful'
        | 'logout'
        | 'logout-successful'
        | 'recovery-sent'
        | 'settings-successful'
        | 'verification';
    data?: any;
}

export interface InvityAuthenticationProps {
    selectedAccount: Extract<AppState['wallet']['selectedAccount'], { status: 'loaded' }>;
    redirectUnauthorizedUserToLogin?: boolean;
}

const InvityAuthentication: React.FC<InvityAuthenticationProps> = ({
    children,
    selectedAccount,
    redirectUnauthorizedUserToLogin = false,
}) => {
    const [iframeMessage, setIframeMessage] = useState<IframeMessage>();
    const { account } = selectedAccount;
    const { invityAuthentication, selectedProvider, invityServerEnvironment } = useSelector(
        state => ({
            invityServerEnvironment: state.suite.settings.debug.invityServerEnvironment,
            invityAuthentication: state.wallet.coinmarket.invityAuthentication,
            selectedProvider: state.wallet.coinmarket.savings.selectedProvider,
        }),
    );

    if (invityServerEnvironment) {
        invityAPI.setInvityServersEnvironment(invityServerEnvironment);
    }

    const {
        loadInvityAuthentication,
        clearInvityAuthentication,
        addToast,
        loadSavingsTrade,
        loadInvityData,
    } = useActions({
        loadInvityAuthentication: coinmarketCommonActions.loadInvityAuthentication,
        clearInvityAuthentication: coinmarketCommonActions.clearInvityAuthentication,
        loadInvityData: coinmarketCommonActions.loadInvityData,
        loadSavingsTrade: coinmarketSavingsActions.loadSavingsTrade,
        addToast: notificationActions.addToast,
    });
    const { navigateToInvityRegistrationSuccessful, navigateToInvitySettingsSuccessful } =
        useInvityNavigation(account);

    useEffectOnce(() => {
        const messageHandler = (event: MessageEvent) => {
            // Listen for iframe messages and redirect after user has logged in
            try {
                // There are different messages (e.g. from Hotjar), not all of them return JSON
                const message: IframeMessage = JSON.parse(event.data);
                if (message && message.name === 'invity-authentication') {
                    setIframeMessage(message);
                }
                // eslint-disable-next-line no-empty
            } catch {}
        };

        window.addEventListener('message', messageHandler);
        return () => window.removeEventListener('message', messageHandler);
    });

    useEffect(() => {
        loadInvityData();
    }, [loadInvityData]);

    useEffect(() => {
        if (iframeMessage) {
            switch (iframeMessage.action) {
                case 'registration-successful':
                    navigateToInvityRegistrationSuccessful();
                    break;
                case 'login-successful': {
                    if (invityAuthentication && selectedProvider) {
                        if (selectedProvider.flow.afterLogin.isEnabled) {
                            const returnUrl = `${window.location.origin}${getPrefixedURL(
                                getRoute('wallet-invity-user-info'),
                            )}`;
                            invityAPI
                                .getAfterLogin(selectedProvider.name, returnUrl)
                                .then(response => {
                                    if (response.form) {
                                        const { formMethod, formAction, fields } = response.form;
                                        submitRequestForm(formMethod, formAction, fields);
                                    } else {
                                        loadSavingsTrade(selectedProvider.name);
                                    }
                                });
                        } else {
                            loadSavingsTrade(selectedProvider.name);
                        }
                    } else {
                        loadInvityAuthentication(redirectUnauthorizedUserToLogin);
                    }
                    break;
                }
                case 'logout-successful':
                    if (invityAuthentication) {
                        clearInvityAuthentication();
                    }
                    break;
                case 'settings-successful':
                    navigateToInvitySettingsSuccessful();
                    break;
                // eslint-disable-next-line no-fallthrough
                default:
            }
        }
    }, [
        addToast,
        iframeMessage,
        invityAuthentication,
        loadInvityAuthentication,
        loadSavingsTrade,
        navigateToInvityRegistrationSuccessful,
        redirectUnauthorizedUserToLogin,
        clearInvityAuthentication,
        selectedProvider,
        navigateToInvitySettingsSuccessful,
    ]);

    useEffect(() => {
        if (typeof window !== 'undefined' && !inIframe() && !invityAuthentication) {
            loadInvityAuthentication(redirectUnauthorizedUserToLogin);
        }
    }, [invityAuthentication, loadInvityAuthentication, redirectUnauthorizedUserToLogin]);

    return (
        <InvityAuthenticationContext.Provider value={{ iframeMessage }}>
            {children}
        </InvityAuthenticationContext.Provider>
    );
};

export default InvityAuthentication;
