import coinsJSON from '@trezor/connect-common/files/coins.json';

import { getNetworkLabel } from '../ethereumUtils';

import { parseCoinsJson, getEthereumNetwork } from '../../data/coinInfo';

parseCoinsJson(coinsJSON);

// REF-TODO: sharing types used only in tests?
type Fixtures<TestedMethod extends (...args: any) => any> = {
    description: string;
    input: Parameters<TestedMethod>;
    output: ReturnType<TestedMethod>;
}[];

export const getNetworkLabelFixtures: Fixtures<typeof getNetworkLabel> = [
    {
        description: 'eth',
        input: ['Export #NETWORK address', getEthereumNetwork('eth')],
        output: 'Export Ethereum address',
    },
    {
        description: 'etc',
        input: ['Export #NETWORK address', getEthereumNetwork('etc')],
        output: 'Export Ethereum Classic address',
    },
];
