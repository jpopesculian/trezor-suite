import React from 'react';
import styled from 'styled-components';
import { ConfirmOnDevice, H1, variables } from '@trezor/components';
import { Modal, ModalProps } from '@suite-components';
import { Translation } from '@suite-components/Translation';
import { DeviceConfirmImage } from '@suite-components/images/DeviceConfirmImage';
import { TrezorDevice } from '@suite-types';

const StyledModal = styled(Modal)`
    width: 360px;
`;

const StyledH1 = styled(H1)`
    margin-top: 12px;
    font-weight: ${variables.FONT_WEIGHT.MEDIUM};
`;

interface ConfirmActionProps extends ModalProps {
    device: TrezorDevice;
}

export const ConfirmActionModal = ({ device, ...rest }: ConfirmActionProps) => (
    <StyledModal
        modalPrompt={
            <ConfirmOnDevice
                title={<Translation id="TR_CONFIRM_ON_TREZOR" />}
                trezorModel={device.features?.major_version === 1 ? 1 : 2}
                animated
            />
        }
        data-test="@suite/modal/confirm-action-on-device"
        {...rest}
    >
        <DeviceConfirmImage device={device} />

        <StyledH1>
            <Translation id="TR_CONFIRM_ACTION_ON_YOUR" values={{ deviceLabel: device.label }} />
        </StyledH1>
    </StyledModal>
);
