import { AbstractMethod } from '../core/AbstractMethod';

export default class ComposeTransaction extends AbstractMethod<'composeTransaction'> {
    init() {}
    run() {
        this.payload.coin = 'a';
        return Promise.reject(new Error('a'));
    }
}
