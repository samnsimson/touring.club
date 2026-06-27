import type { E2EApi } from '@tc/testing';
import { createAuthE2EApi } from './support/auth-client';

describe('Auth Service validation', () => {
    let api: E2EApi;

    beforeAll(() => {
        api = createAuthE2EApi();
    });

    it('POST /api/v1/auth/sign-up validates request body', async () => {
        const body = { name: 'E2E User', password: 'Str0ngPass!', rememberMe: true };
        const response = await api.post('/api/v1/auth/sign-up', body);
        expect(response.status).toBe(400);
    });

    it('POST /api/v1/auth/sign-in validates request body', async () => {
        const response = await api.post('/api/v1/auth/sign-in', { password: 'Str0ngPass!' });
        expect(response.status).toBe(400);
    });

    it('POST /api/v1/auth/verify-email validates request body', async () => {
        const response = await api.post('/api/v1/auth/verify-email', {});
        expect(response.status).toBe(400);
    });

    it('POST /api/v1/auth/forgot-password validates request body', async () => {
        const response = await api.post('/api/v1/auth/forgot-password', {});
        expect(response.status).toBe(400);
    });

    it('POST /api/v1/auth/reset-password validates request body', async () => {
        const response = await api.post('/api/v1/auth/reset-password', { newPassword: 'ResetStr0ng1!' });
        expect(response.status).toBe(400);
    });

    it('GET /api/v1/auth/me requires authentication', async () => {
        const response = await api.get('/api/v1/auth/me');
        expect(response.status).toBe(401);
    });
});
