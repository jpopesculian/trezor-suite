import React from 'react';
import { transparentize } from 'polished';
import styled, { css } from 'styled-components';

import { findRouteByName } from '@suite-utils/router';
import { variables, HoverAnimation } from '@trezor/components';
import { Translation } from '@suite-components';
import { MAIN_MENU_ITEMS } from '@suite-constants/menu';
import { useAnalytics, useActions, useSelector, useAccountSearch } from '@suite-hooks';
import * as routerActions from '@suite-actions/routerActions';

interface ComponentProps {
    isActive: boolean;
    isDisabled?: boolean;
}

const Wrapper = styled.div`
    display: flex;
    flex: 1;
    justify-content: center;
    height: 100%;
`;

const MobileWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0px 16px;
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.STROKE_GREY};
`;

const StyledHoverAnimation = styled(HoverAnimation)`
    & + & {
        margin-left: 12px;
    }
`;

const MenuItem = styled.div<ComponentProps>`
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 12px;
    font-size: 16px;
    cursor: ${({ isDisabled, isActive }) => (!isDisabled && !isActive ? 'pointer' : 'default')};
`;

const MobileMenuItem = styled.div<ComponentProps>`
    display: flex;
    padding: 20px 24px;
    font-size: ${({ isActive }) => (isActive ? '20px' : '16px')};
    font-weight: ${({ isActive }) => isActive && variables.FONT_WEIGHT.DEMI_BOLD};
    cursor: ${({ isDisabled, isActive }) => (!isDisabled && !isActive ? 'pointer' : 'default')};

    & + & {
        border-top: 1px solid ${props => props.theme.STROKE_GREY};
    }
`;

const ItemTitleWrapper = styled.span`
    position: relative;
`;

const ItemTitle = styled.span<ComponentProps>`
    color: ${props => transparentize(0.3, props.theme.TYPE_DARK_GREY)};
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
    font-size: ${variables.FONT_SIZE.NORMAL};
    line-height: 24px;

    ${({ isActive }) =>
        isActive &&
        css`
            color: ${({ theme }) => theme.TYPE_DARK_GREY};
            font-size: ${variables.FONT_SIZE.H3};
        `}

    ${({ isDisabled }) =>
        isDisabled &&
        css`
            cursor: default;
        `}
`;

const NewBadge = styled.span`
    span {
        position: absolute;
        top: -14px;
        right: -30px;
        padding: 3px 3px 2px 3px;
        background: ${props => props.theme.BG_LIGHT_GREEN};
        color: ${props => props.theme.TYPE_GREEN};
        letter-spacing: 0.2px;
        text-transform: UPPERCASE;
        font-size: 12px;
        display: flex;
        cursor: default;
        align-items: center;
        font-weight: ${variables.FONT_WEIGHT.DEMI_BOLD};
        border-radius: 4px;
    }
`;

interface MainNavigationProps {
    closeMainNavigation?: () => void;
    isMobileLayout?: boolean;
}

export const MainNavigation = ({ isMobileLayout, closeMainNavigation }: MainNavigationProps) => {
    const activeApp = useSelector(state => state.router.app);
    const { goto } = useActions({
        goto: routerActions.goto,
    });

    const analytics = useAnalytics();
    const { setCoinFilter, setSearchString } = useAccountSearch();

    const gotoWithReport = (routeName: typeof MAIN_MENU_ITEMS[number]['route']) => {
        switch (routeName) {
            case 'suite-index':
                analytics.report({ type: 'menu/goto/suite-index' });
                break;
            case 'wallet-index':
                setCoinFilter(undefined);
                setSearchString(undefined);
                analytics.report({ type: 'menu/goto/wallet-index' });
                break;
            default:
            // no default
        }
        goto(routeName);
    };

    const WrapperComponent = isMobileLayout ? MobileWrapper : Wrapper;
    const MenuItemComponent = isMobileLayout ? MobileMenuItem : MenuItem;

    return (
        <WrapperComponent>
            {MAIN_MENU_ITEMS.map(item => {
                const { route, translationId, isDisabled } = item;
                const routeObj = findRouteByName(route);
                const isActive = routeObj ? routeObj.app === activeApp : false;
                return (
                    <StyledHoverAnimation isHoverable={!isActive} key={route}>
                        <MenuItemComponent
                            data-test={`@suite/menu/${route}`}
                            onClick={() => {
                                if (!isDisabled) {
                                    gotoWithReport(route);
                                    closeMainNavigation?.();
                                }
                            }}
                            isActive={isActive}
                            isDisabled={isDisabled}
                        >
                            <ItemTitleWrapper>
                                <ItemTitle isActive={isActive} isDisabled={isDisabled}>
                                    <Translation id={translationId} />
                                </ItemTitle>

                                {isDisabled && (
                                    <NewBadge>
                                        <Translation id="TR_SUITE_WEB_LANDING_SUB_SOON" />
                                    </NewBadge>
                                )}
                            </ItemTitleWrapper>
                        </MenuItemComponent>
                    </StyledHoverAnimation>
                );
            })}
        </WrapperComponent>
    );
};
