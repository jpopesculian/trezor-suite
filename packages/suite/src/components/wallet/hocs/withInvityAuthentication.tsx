import React from 'react';
import {
    InvityAuthentication,
    WithInvityLayoutProps,
    withSelectedAccountLoaded,
} from '@wallet-components';

export interface WithInvityAuthenticationOptions {
    navigate?: () => void;
    redirectUnauthorizedUserToLogin: boolean;
}

export type WithInvityAuthenticationProps = WithInvityLayoutProps;

export const withInvityAuthentication = (
    WrappedComponent: React.ComponentType<WithInvityAuthenticationProps>,
    options: WithInvityAuthenticationOptions = {
        redirectUnauthorizedUserToLogin: true,
    },
) => {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    const Component = withSelectedAccountLoaded(
        ({ selectedAccount }: WithInvityLayoutProps) => (
            <InvityAuthentication
                {...options}
                selectedAccount={selectedAccount}
                redirectUnauthorizedUserToLogin
            >
                <WrappedComponent selectedAccount={selectedAccount} />
            </InvityAuthentication>
        ),
        { title: 'TR_NAV_INVITY' },
    );
    Component.displayName = `withInvityAuthentication(${displayName})`;
    return Component;
};
