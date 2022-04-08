import { AbstractMethod } from '../core/AbstractMethod';

export default class ApplyFlags extends AbstractMethod<'applyFlags'> {
    init() {}
    run() {
        // if (this.payload.bundle) {
        //     return Promise.resolve([{ address: '1', serializedPath: '', path: [1] }]);
        // }
        this.payload.flags.toFixed();
        // return Promise.resolve({ address: '1', serializedPath: '', path: [] });

        //
        // this.name;

        // this.payload.bundle?.forEach(element => {});
        // return Promise.resolve([{ address: '1', serializedPath: '', path: [1] }]);

        return Promise.resolve({ message: '1' });
    }
}
