import React from 'react';
import styled from 'styled-components';
import FocusLock from 'react-focus-lock';
import {
    Modal as TrezorModal,
    Backdrop,
    variables,
    ConfirmOnDevice,
    Icon,
    useTheme,
} from '@trezor/components';
import { Translation } from '..';
import { useGuide } from '@guide-hooks/useGuide';
import { useSelector } from '@suite-hooks/useSelector';

const GuideBackdrop = styled(Backdrop)<{ guideOpen: boolean }>`
    transition: all 0.3s;
    right: ${({ guideOpen }) => (guideOpen ? variables.LAYOUT_SIZE.GUIDE_PANEL_WIDTH : '0')};

    & & {
        right: 0;
    }
`;

const AbortContainer = styled.div``;

interface AbortButtonProps {
    onAbort: () => void;
}

const AbortButton = ({ onAbort }: AbortButtonProps) => {
    const theme = useTheme();

    return (
        <AbortContainer>
            <Icon
                size={20}
                color={theme.TYPE_DARK_GREY}
                hoverColor={theme.TYPE_LIGHT_GREY}
                icon="CROSS"
                data-test="@modal/close-button"
                onClick={onAbort}
            />
            <span>ABORT</span>
        </AbortContainer>
    );
};

interface DevicePropmptModalProps {
    isPillShown?: boolean;
    isConfirmed?: boolean;
    onAbort?: () => void;
    pillTitle?: string;
    className?: string;
    children?: React.ReactNode;
    'data-test'?: string;
}

export const DevicePropmptModal = ({
    isPillShown = true,
    isConfirmed,
    onAbort,
    pillTitle,
    ...rest
}: DevicePropmptModalProps) => {
    const deviceVerions = useSelector(state => state.suite.device?.features?.major_version);

    const { isGuideOpen, isModalOpen, isGuideOnTop } = useGuide();

    return (
        <FocusLock disabled={isGuideOpen && isGuideOnTop} group="overlay" autoFocus={false}>
            <GuideBackdrop guideOpen={isGuideOpen && isModalOpen && !isGuideOnTop}>
                <TrezorModal
                    modalPrompt={
                        isPillShown && (
                            <ConfirmOnDevice
                                title={pillTitle || <Translation id="TR_CONFIRM_ON_TREZOR" />}
                                trezorModel={deviceVerions === 1 ? 1 : 2}
                                animated
                                animation={isConfirmed ? 'SLIDE_DOWN' : 'SLIDE_UP'}
                            />
                        )
                    }
                    headerComponents={[AbortButton]}
                    {...rest}
                />
            </GuideBackdrop>
        </FocusLock>
    );
};
