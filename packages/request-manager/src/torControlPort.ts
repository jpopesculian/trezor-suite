import net, { Socket } from 'net';
import fs from 'fs';
import crypto from 'crypto';
import util from 'util';
import path from 'path';
import { TorConnectionOptions } from './types';

const readFile = util.promisify(fs.readFile);
const randomBytes = util.promisify(crypto.randomBytes);

const getCookieString = async (authFilePath: string) => {
    const controlAuthCookiePath = path.join(authFilePath, 'control_auth_cookie');
    return (await readFile(controlAuthCookiePath)).toString('hex');
};

const getClientNonce = async () => (await randomBytes(32)).toString('hex');

export class TorControlPort {
    options: TorConnectionOptions;
    socket: Socket;
    isSocketConnected = false;
    clientNonce = '';

    constructor(options: TorConnectionOptions) {
        this.options = options;
        this.socket = new net.Socket();
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.isSocketConnected) {
                return resolve(true);
            }

            this.socket.connect(this.options.controlPort, this.options.host);

            this.socket.on('connect', async () => {
                await (async () => {
                    this.clientNonce = await getClientNonce();
                    this.socket.write(`AUTHCHALLENGE SAFECOOKIE ${this.clientNonce}\r\n`);
                })();
            });

            this.socket.on('close', () => {
                this.isSocketConnected = false;
                reject();
            });

            this.socket.on('timeout', () => {
                this.isSocketConnected = false;
                reject();
            });

            this.socket.on('data', async data => {
                const message = data.toString();
                // Section 3.24. AUTHCHALLENGE in https://gitweb.torproject.org/torspec.git/tree/control-spec.txt
                // https://stem.torproject.org/faq.html#i-m-using-safe-cookie-authentication
                const authchallengeResponse = message
                    .trim()
                    .match(
                        /^250 AUTHCHALLENGE SERVERHASH=([a-fA-F0-9]+) SERVERNONCE=([a-fA-F0-9]+)$/,
                    );
                if (authchallengeResponse) {
                    const cookieString = await getCookieString(this.options.authFilePath);
                    const serverNonce = authchallengeResponse[2];
                    const authString = `${cookieString}${this.clientNonce}${serverNonce}`;

                    const bufferToSign = Buffer.from(authString, 'hex');
                    // key is a hardcoded string provided by the TOR control-spec
                    const key = 'Tor safe cookie authentication controller-to-server hash';
                    const authSignature = crypto
                        .createHmac('sha256', key)
                        .update(bufferToSign)
                        .digest('hex')
                        .toUpperCase();

                    this.socket.write(`AUTHENTICATE ${authSignature}\r\n`);
                    this.socket.write('GETINFO circuit-status\n');
                    this.isSocketConnected = true;
                    resolve(true);
                }
            });

            this.socket.on('end', () => {
                reject();
            });

            this.socket.on('error', error => {
                this.socket.removeAllListeners();
                reject(error);
            });
        });
    }

    ping() {
        if (!this.isSocketConnected) {
            return false;
        }
        try {
            return !!this.socket.write('GETINFO\r\n');
        } catch (error) {
            return false;
        }
    }
}
