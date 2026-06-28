import { E2EApplication, MockEmailService, requireDatabase, E2eSessionAuthGuard, type E2EApi } from '@tc/testing';
import { authedApi, createVerifiedUser, signInUser } from './support/auth-scenarios';
import { createAuthE2EAppModule } from './support/e2e-app.module';

const mockEmailService = new MockEmailService();
const e2eApplication = new E2EApplication({
    rootModule: createAuthE2EAppModule(mockEmailService),
    globalPrefix: 'api',
    authGuard: E2eSessionAuthGuard,
});

describe('Auth session', () => {
    let api: E2EApi;

    beforeAll(async () => {
        await e2eApplication.bootstrap();
        api = e2eApplication.getApi();
    }, 60_000);

    afterAll(async () => {
        await e2eApplication.close();
    });

    beforeEach(() => {
        mockEmailService.clear();
    });

    it('GET /api/v1/auth/me returns the authenticated user', async () => {
        if (!requireDatabase('get me')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        const response = await authedApi(api, user).get('/api/v1/auth/me');
        expect(response.status).toBe(200);
        expect(response.body.email).toBe(user.email);
    });

    it('PATCH /api/v1/auth/me updates the user profile', async () => {
        if (!requireDatabase('update profile')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        const client = authedApi(api, user);
        const response = await client.patch('/api/v1/auth/me', { name: 'E2E User Updated' });
        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('E2E User Updated');
    });

    it('POST /api/v1/auth/sign-in issues a new session', async () => {
        if (!requireDatabase('sign-in')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        await signInUser(api, user);
    });

    it('POST /api/v1/auth/sign-out invalidates the session', async () => {
        if (!requireDatabase('sign-out')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        const signInRes = await signInUser(api, user);
        const client = authedApi(api, { accessToken: signInRes.body.accessToken, sessionToken: signInRes.body.sessionToken });
        const signOutRes = await client.post('/api/v1/auth/sign-out');
        expect(signOutRes.status).toBe(200);
        expect(signOutRes.body.success).toBe(true);
        const meRes = await client.get('/api/v1/auth/me');
        expect(meRes.status).toBe(401);
    });
});
