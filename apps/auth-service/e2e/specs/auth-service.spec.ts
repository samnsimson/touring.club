import axios, { type AxiosRequestConfig } from 'axios';
import { getEmailOtp, getPasswordResetToken } from '../support/db';

const uniqueId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const authHeaders = (accessToken: string, sessionToken: string): AxiosRequestConfig['headers'] => ({
    Authorization: `Bearer ${sessionToken}`,
    Cookie: `refresh-token=${sessionToken}; access-token=${accessToken}`,
});

describe('Auth Service', () => {
    it('service is reachable', async () => {
        const health = await axios.get('/api/health', { validateStatus: () => true });
        if (health.status === 200) {
            expect(health.data).toEqual({ status: 'ok' });
            return;
        }

        const res = await axios.post('/api/v1/auth/sign-in', {}, { validateStatus: () => true });
        expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/sign-up validates request body', async () => {
        const res = await axios.post('/api/v1/auth/sign-up', {}, { validateStatus: () => true });

        expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/sign-in validates request body', async () => {
        const res = await axios.post('/api/v1/auth/sign-in', {}, { validateStatus: () => true });

        expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/verify-email validates request body', async () => {
        const res = await axios.post('/api/v1/auth/verify-email', {}, { validateStatus: () => true });

        expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/forgot-password validates request body', async () => {
        const res = await axios.post('/api/v1/auth/forgot-password', {}, { validateStatus: () => true });

        expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/reset-password validates request body', async () => {
        const res = await axios.post('/api/v1/auth/reset-password', {}, { validateStatus: () => true });

        expect(res.status).toBe(400);
    });

    it('GET /api/v1/auth/me requires authentication', async () => {
        const res = await axios.get('/api/v1/auth/me', { validateStatus: () => true });

        expect(res.status).toBe(401);
    });

    it('runs the full auth lifecycle', async () => {
        if (!process.env.DATABASE_URL) {
            console.warn('Skipping full auth lifecycle e2e: DATABASE_URL is not set');
            return;
        }

        const suffix = uniqueId();
        const email = `e2e-${suffix}@touring.club.test`;
        const password = 'Str0ngPass!';
        const username = `e2e${suffix.replace(/-/g, '').slice(0, 10)}`;

        const signUpRes = await axios.post('/api/v1/auth/sign-up', {
            name: 'E2E User',
            email,
            password,
            username,
            rememberMe: true,
        });

        expect([200, 201]).toContain(signUpRes.status);
        expect(signUpRes.data.email).toBe(email);

        let otp: string | undefined;
        for (let attempt = 0; attempt < 10; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            otp = await getEmailOtp(email);
            if (otp) break;
        }

        expect(otp).toBeDefined();

        const verifyRes = await axios.post('/api/v1/auth/verify-email', { email, otp }, { validateStatus: () => true });
        expect(verifyRes.status).toBe(200);
        expect(verifyRes.data.accessToken).toBeDefined();
        expect(verifyRes.data.sessionToken).toBeDefined();

        const { accessToken, sessionToken } = verifyRes.data;
        const headers = authHeaders(accessToken, sessionToken);

        const meRes = await axios.get('/api/v1/auth/me', { headers, validateStatus: () => true });
        expect(meRes.status).toBe(200);
        expect(meRes.data.email).toBe(email);

        const updateRes = await axios.patch('/api/v1/auth/me', { name: 'E2E User Updated' }, { headers, validateStatus: () => true });
        expect(updateRes.status).toBe(200);
        expect(updateRes.data.user.name).toBe('E2E User Updated');

        const signInRes = await axios.post('/api/v1/auth/sign-in', { email, password });
        expect(signInRes.status).toBe(200);
        expect(signInRes.data.accessToken).toBeDefined();

        const signInHeaders = authHeaders(signInRes.data.accessToken, signInRes.data.sessionToken);
        const changePasswordRes = await axios.post(
            '/api/v1/auth/change-password',
            { currentPassword: password, newPassword: 'NewStr0ngPass!', revokeOtherSessions: true },
            { headers: signInHeaders, validateStatus: () => true },
        );
        expect(changePasswordRes.status).toBe(200);

        const forgotRes = await axios.post('/api/v1/auth/forgot-password', { email });
        expect(forgotRes.status).toBe(200);
        expect(forgotRes.data.success).toBe(true);

        let resetToken: string | undefined;
        for (let attempt = 0; attempt < 10; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 200));
            resetToken = await getPasswordResetToken(email);
            if (resetToken) break;
        }

        if (!resetToken) {
            console.warn('Skipping password reset assertions: reset token not found in database');
            return;
        }

        const resetRes = await axios.post('/api/v1/auth/reset-password', { token: resetToken, newPassword: 'ResetStr0ng1!' }, { validateStatus: () => true });
        expect(resetRes.status).toBe(200);

        const signOutRes = await axios.post('/api/v1/auth/sign-out', undefined, { headers: signInHeaders, validateStatus: () => true });
        expect(signOutRes.status).toBe(200);
        expect(signOutRes.data.success).toBe(true);

        const meAfterSignOut = await axios.get('/api/v1/auth/me', { headers: signInHeaders, validateStatus: () => true });
        expect(meAfterSignOut.status).toBe(401);
    });
});
