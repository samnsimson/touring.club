jest.mock('@tc/api-sdk/clients/auth-service/client', () => ({ createClient: jest.fn(() => 'auth-client') }));
jest.mock('@tc/api-sdk/clients/auth-service', () => ({ AuthServiceSdk: jest.fn() }));

import { createClient } from '@tc/api-sdk/clients/auth-service/client';
import { AuthServiceSdk } from '@tc/api-sdk/clients/auth-service';
import { ClientApi } from '../../src/client';

const createClientMock = createClient as jest.Mock;
const AuthServiceSdkMock = AuthServiceSdk as jest.Mock;

describe('ClientApi', () => {
    beforeEach(() => {
        createClientMock.mockClear();
        AuthServiceSdkMock.mockClear();
    });

    it('defaults credentials to include and omits auth when not provided', () => {
        const clientApi = new ClientApi({ baseUrl: 'https://kong.local' });
        void clientApi.authService;

        expect(createClientMock).toHaveBeenCalledWith({ baseUrl: 'https://kong.local', credentials: 'include' });
        expect(AuthServiceSdkMock).toHaveBeenCalledWith({ client: 'auth-client' });
    });

    it('forwards explicit credentials and auth', () => {
        const auth = () => 'token';
        const clientApi = new ClientApi({ baseUrl: 'https://kong.local', credentials: 'omit', auth });
        void clientApi.authService;

        expect(createClientMock).toHaveBeenCalledWith({ baseUrl: 'https://kong.local', credentials: 'omit', auth });
    });

    it('builds a fresh client per access', () => {
        const clientApi = new ClientApi({ baseUrl: 'https://kong.local' });

        void clientApi.authService;
        void clientApi.authService;

        expect(createClientMock).toHaveBeenCalledTimes(2);
    });
});
