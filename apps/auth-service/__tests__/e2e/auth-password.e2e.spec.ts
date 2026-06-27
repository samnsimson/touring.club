import type { E2EApi } from '@tc/testing';
import { createAuthE2EApi } from './support/auth-client';
import { authedApi, createVerifiedUser, requireDatabase, signInUser } from './support/auth-scenarios';

describe('Auth password', () => {
    let api: E2EApi;

    beforeAll(() => {
        api = createAuthE2EApi();
    });

    beforeEach(() => {
        api.emailCapture.clear();
    });

    it('POST /api/v1/auth/change-password updates the password for an authenticated user', async () => {
        if (!requireDatabase('change-password')) return;
        const user = await createVerifiedUser(api);
        const signInRes = await signInUser(api, user);
        const client = authedApi({ accessToken: signInRes.body.accessToken, sessionToken: signInRes.body.sessionToken });
        const changePasswordBody = { currentPassword: user.password, newPassword: 'NewStr0ngPass!', revokeOtherSessions: true };
        const response = await client.post('/api/v1/auth/change-password', changePasswordBody);
        expect(response.status).toBe(200);
    });

    it('POST /api/v1/auth/forgot-password accepts a reset request', async () => {
        if (!requireDatabase('forgot-password')) return;
        const user = await createVerifiedUser(api);
        const response = await api.post('/api/v1/auth/forgot-password', { email: user.email });
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it('POST /api/v1/auth/reset-password resets the password using the emailed token', async () => {
        if (!requireDatabase('reset-password')) return;
        const user = await createVerifiedUser(api);
        const forgotRes = await api.post('/api/v1/auth/forgot-password', { email: user.email });
        expect(forgotRes.status).toBe(200);
        const resetEmail = await api.emailCapture.waitFor({ to: user.email, subjectIncludes: 'Reset your Touring Club password' });
        const resetToken = api.emailCapture.extractResetToken(resetEmail.text);
        expect(resetToken).toBeDefined();
        const response = await api.post('/api/v1/auth/reset-password', { token: resetToken, newPassword: 'ResetStr0ng1!' });
        expect(response.status).toBe(200);
    });
});
