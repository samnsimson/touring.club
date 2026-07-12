import { SdkBinder } from '../../src/utils/bind-sdk';

describe('SdkBinder', () => {
    it('injects the client into every bound function call', () => {
        const client = { id: 'test-client' };
        const sdk = {
            getThing: (options?: { client?: unknown; id?: string }) => options,
        };

        const bound = SdkBinder.bind(sdk, client);
        const result = bound.getThing({ id: '123' });

        expect(result).toEqual({ id: '123', client });
    });

    it('passes non-function exports through unchanged', () => {
        const client = { id: 'test-client' };
        const sdk = { VERSION: '1.0.0' };

        const bound = SdkBinder.bind(sdk, client);

        expect(bound.VERSION).toBe('1.0.0');
    });
});
