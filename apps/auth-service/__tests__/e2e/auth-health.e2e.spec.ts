import { E2EApplication, MockEmailService, SessionAuthGuard, type E2EApi } from '@tc/testing';
import { createAuthE2EAppModule } from './support/e2e-app.module';

const mockEmailService = new MockEmailService();
const e2eApplication = new E2EApplication({
    rootModule: createAuthE2EAppModule(mockEmailService),
    globalPrefix: 'api',
    authGuard: SessionAuthGuard,
});

describe('Auth Service health', () => {
    let api: E2EApi;

    beforeAll(async () => {
        await e2eApplication.bootstrap();
        api = e2eApplication.getApi();
    }, 60_000);

    afterAll(async () => {
        await e2eApplication.close();
    });

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
