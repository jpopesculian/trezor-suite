import { config } from '@trezor/connect/lib/data/config';

// handle message received from connect.js
const handleMessage = (event: MessageEvent) => {
    if (!event.data) return;
    const { data } = event;

    const exists = document.getElementsByTagName('button');
    if (exists && exists.length > 0) {
        return;
    }

    const filters = config.webusb.map(desc => ({
        vendorId: parseInt(desc.vendorId, 16),
        productId: parseInt(desc.productId, 16),
    }));

    const button = document.createElement('button');

    if (typeof data.style === 'string') {
        const css: { [k: string]: string } = JSON.parse(data.style);
        Object.keys(css).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(button.style, key)) {
                button.style.setProperty(key, css[key]);
            }
        });
    } else {
        button.className = 'default';
    }

    button.onclick = async () => {
        const { usb } = navigator;
        if (usb) {
            try {
                await usb.requestDevice({ filters });
            } catch (error) {
                // empty
            }
        }
    };

    if (document.body) {
        document.body.append(button);
    }
};

window.addEventListener('message', handleMessage);
