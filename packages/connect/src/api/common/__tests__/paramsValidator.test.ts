import { DataManager } from '../../../data/DataManager';
import { config } from '../../../data/config';
import { validateParams, getFirmwareRange } from '../paramsValidator';
import * as fixtures from '../__fixtures__/paramsValidator';

describe('helpers/paramsValidator', () => {
    describe('validateParams', () => {
        fixtures.validateParams.forEach(f => {
            it(f.description, () => {
                if (!f.success) {
                    expect(() =>
                        validateParams({ param: f.value }, [{ name: 'param', ...f }] as any),
                    ).toThrow();
                } else {
                    expect(() =>
                        validateParams({ param: f.value }, [{ name: 'param', ...f }] as any),
                    ).not.toThrow();
                }
            });
        });
    });

    describe('getFirmwareRange', () => {
        afterEach(() => {
            jest.clearAllMocks();
        });
        fixtures.getFirmwareRange.forEach(f => {
            it(f.description, () => {
                // @ts-expect-error partial response
                jest.spyOn(DataManager, 'getConfig').mockImplementation(() => f.config || config);
                // @ts-expect-error partial params
                expect(getFirmwareRange(...f.params)).toEqual(f.result);
            });
        });
    });
});
