import { E2EApplication, MockEmailService, requireDatabase, E2eSessionAuthGuard, type E2EApi } from '@tc/testing';
import { authedApi, createVerifiedUser, signInUser } from './support/auth-scenarios';
import { createAuthE2EAppModule } from './support/e2e-app.module';

const mockEmailService = new MockEmailService();
const e2eApplication = new E2EApplication({
    globalPrefix: 'api',
    rootModule: createAuthE2EAppModule(mockEmailService),
    authGuard: E2eSessionAuthGuard,
});

describe('Auth password', () => {
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

    it('POST /api/v1/auth/change-password updates the password for an authenticated user', async () => {
        if (!requireDatabase('change-password')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        const signInRes = await signInUser(api, user);
        const client = authedApi(api, { accessToken: signInRes.body.accessToken, sessionToken: signInRes.body.sessionToken });
        const changePasswordBody = { currentPassword: user.password, newPassword: 'NewStr0ngPass!', revokeOtherSessions: true };
        const response = await client.post('/api/v1/auth/change-password', changePasswordBody);
        expect(response.status).toBe(200);
    });

    it('POST /api/v1/auth/forgot-password accepts a reset request', async () => {
        if (!requireDatabase('forgot-password')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        const response = await api.post('/api/v1/auth/forgot-password', { email: user.email });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('POST /api/v1/auth/reset-password resets the password using the emailed token', async () => {
        if (!requireDatabase('reset-password')) return;
        const user = await createVerifiedUser(api, mockEmailService);
        const forgotRes = await api.post('/api/v1/auth/forgot-password', { email: user.email });
        expect(forgotRes.status).toBe(200);
        const resetEmail = await mockEmailService.waitFor({ to: user.email, subjectIncludes: 'Reset your Touring Club password' });
        const resetToken = mockEmailService.extractResetToken(resetEmail.text);
        expect(resetToken).toBeDefined();
        const response = await api.post('/api/v1/auth/reset-password', { token: resetToken, newPassword: 'ResetStr0ng1!' });
        expect(response.status).toBe(200);
    });
});
