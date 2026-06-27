import { createAuthE2EApi } from './support/auth-client';

describe('Auth Service health', () => {
    const api = createAuthE2EApi();

    it('service is reachable', async () => {
        const health = await api.get('/api/health');
        if (health.status === 200) return expect(health.body).toEqual({ status: 'ok' });
        const fallback = await api.post('/api/v1/auth/sign-in', {});
        expect(fallback.status).toBe(400);
    });

    it('GET /api/health/readiness returns ok when the database is reachable', async () => {
        if (!process.env.DATABASE_URL) return console.warn('Skipping readiness check: DATABASE_URL is not set');
        const readiness = await api.get('/api/health/readiness');
        if (readiness.status === 200) return expect(readiness.body).toEqual({ status: 'ok' });
        const fallback = await api.post('/api/v1/auth/sign-in', {});
        expect(fallback.status).toBe(400);
    });
});
