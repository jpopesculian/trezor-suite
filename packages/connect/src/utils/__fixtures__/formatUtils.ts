import coinsJSON from '@trezor/connect-common/files/coins.json';

import { formatAmount } from '../formatUtils';

import { parseCoinsJson, getBitcoinNetwork } from '../../data/coinInfo';

parseCoinsJson(coinsJSON);

// REF-TODO: sharing types used only in tests?
type Fixtures<TestedMethod extends (...args: any) => any> = {
    description: string;
    input: Parameters<TestedMethod>;
    output: ReturnType<TestedMethod>;
}[];

export const formatAmountFixtures: Fixtures<typeof formatAmount> = [
    {
        description: '10',
        input: ['10', getBitcoinNetwork('btc')!],
        output: '0.0000001 BTC',
    },
];
