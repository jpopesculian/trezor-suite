import { UI, UiMessage, CoreMessage } from '../../events';
import { DEVICE } from '../../events/device';

import type { TypedCall, FirmwareUpload } from '@trezor/transport/lib/types/messages';
import type { IDevice } from '../../device/Device';

// firmware does not send button message but user still must press button to continue
// with fw update.
const postConfirmationMessage = (device: IDevice) => {
    // only if firmware is already installed. fresh device does not require button confirmation
    if (device.features.firmware_present) {
        device.emit(DEVICE.BUTTON, device, { code: 'ButtonRequest_FirmwareUpdate' });
    }
};

const postProgressMessage = (
    device: IDevice,
    progress: number,
    postMessage: (message: CoreMessage) => void,
) => {
    postMessage(
        UiMessage(UI.FIRMWARE_PROGRESS, {
            device: device.toMessageObject(),
            progress,
        }),
    );
};

export const uploadFirmware = async (
    typedCall: TypedCall,
    postMessage: (message: CoreMessage) => void,
    device: IDevice,
    { payload }: FirmwareUpload,
) => {
    // let response: MessageResponse<'Success' | 'FirmwareRequest'> = {};

    if (device.features.major_version === 1) {
        postConfirmationMessage(device);
        await typedCall('FirmwareErase', 'Success', {});
        postProgressMessage(device, 0, postMessage);
        const { message } = await typedCall('FirmwareUpload', 'Success', {
            payload,
        });
        postProgressMessage(device, 100, postMessage);
        return message;
    }

    if (device.features.major_version === 2) {
        postConfirmationMessage(device);
        const length = payload.byteLength;
        let response = await typedCall('FirmwareErase', 'FirmwareRequest', { length });

        // REF-TODO: first response is never success. but this should be refactored anyway, typedCall unions
        // @ts-ignore
        while (response.type !== 'Success') {
            const start: number = response.message.offset!;
            const end = response.message.offset! + response.message.length!;
            const chunk = payload.slice(start, end);
            // in this moment, device is still displaying 'update firmware dialog', no firmware process is in progress yet
            if (start > 0) {
                postProgressMessage(device, Math.round((start / length) * 100), postMessage);
            }
            // REF-TODO: typedCall accept unions
            // @ts-ignore
            response = await typedCall('FirmwareUpload', 'FirmwareRequest|Success', {
                payload: chunk,
            });
        }
        postProgressMessage(device, 100, postMessage);
        // $FlowIssue typedCall problem with unions in response, TODO: accept unions
        return response.message;
    }
};
