jest.mock('@tc/api-sdk/clients/auth-service/client.gen', () => ({ client: { setConfig: jest.fn() } }));

import { client } from '@tc/api-sdk/clients/auth-service/client.gen';
import { configureAuthServiceClient } from '../../src/apis/auth-service.client-api';

const setConfig = client.setConfig as jest.Mock;

describe('configureAuthServiceClient', () => {
    beforeEach(() => setConfig.mockClear());

    it('defaults credentials to include and omits auth when not provided', () => {
        configureAuthServiceClient({ baseUrl: 'https://kong.local' });

        expect(setConfig).toHaveBeenCalledWith({ baseUrl: 'https://kong.local', credentials: 'include' });
    });

    it('forwards explicit credentials and auth', () => {
        const auth = () => 'token';
        configureAuthServiceClient({ baseUrl: 'https://kong.local', credentials: 'omit', auth });

        expect(setConfig).toHaveBeenCalledWith({ baseUrl: 'https://kong.local', credentials: 'omit', auth });
    });
});
