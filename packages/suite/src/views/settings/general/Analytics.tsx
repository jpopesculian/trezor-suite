import React from 'react';
import styled from 'styled-components';

import { analytics } from '@trezor/analytics';
import * as analyticsActions from '@suite-actions/analyticsActions';
import { Switch } from '@trezor/components';
import { Translation } from '@suite-components/Translation';
import { SectionItem, ActionColumn, TextColumn } from '@suite-components/Settings';
import { useAnchor } from '@suite-hooks/useAnchor';
import { SettingsAnchor } from '@suite-constants/anchors';
import { useSelector, useActions } from '@suite-hooks';

const PositionedSwitch = styled.div`
    align-self: center;
`;

export const Analytics = () => {
    const { anchorRef, shouldHighlight } = useAnchor(SettingsAnchor.Analytics);

    const { enabled } = useSelector(state => state.analytics);

    const { enable, disable } = useActions({
        enable: analyticsActions.enable,
        disable: analyticsActions.disable,
    });

    return (
        <SectionItem
            data-test="@settings/analytics"
            ref={anchorRef}
            shouldHighlight={shouldHighlight}
        >
            <TextColumn
                title={<Translation id="TR_ALLOW_ANALYTICS" />}
                description={<Translation id="TR_ALLOW_ANALYTICS_DESCRIPTION" />}
            />
            <ActionColumn>
                <PositionedSwitch>
                    <Switch
                        dataTest="@analytics/toggle-switch"
                        isChecked={analytics.isEnabled()}
                        onChange={() => {
                            if (enabled) disable();
                            else enable();
                        }}
                    />
                </PositionedSwitch>
            </ActionColumn>
        </SectionItem>
    );
};
