import { createAuthE2EApi } from './support/auth-client';
import { authedApi, createVerifiedUser, requireDatabase, signInUser } from './support/auth-scenarios';

describe('Auth session', () => {
    const api = createAuthE2EApi();

    beforeEach(() => {
        api.emailCapture.clear();
    });

    it('GET /api/v1/auth/me returns the authenticated user', async () => {
        if (!requireDatabase('get me')) return;
        const user = await createVerifiedUser(api);
        const response = await authedApi(user).get('/api/v1/auth/me');
        expect(response.status).toBe(200);
        expect(response.body.email).toBe(user.email);
    });

    it('PATCH /api/v1/auth/me updates the user profile', async () => {
        if (!requireDatabase('update profile')) return;
        const user = await createVerifiedUser(api);
        const client = authedApi(user);
        const response = await client.patch('/api/v1/auth/me', { name: 'E2E User Updated' });
        expect(response.status).toBe(200);
        expect(response.body.user.name).toBe('E2E User Updated');
    });

    it('POST /api/v1/auth/sign-in issues a new session', async () => {
        if (!requireDatabase('sign-in')) return;
        const user = await createVerifiedUser(api);
        await signInUser(api, user);
    });

    it('POST /api/v1/auth/sign-out invalidates the session', async () => {
        if (!requireDatabase('sign-out')) return;
        const user = await createVerifiedUser(api);
        const signInRes = await signInUser(api, user);
        const client = authedApi({ accessToken: signInRes.body.accessToken, sessionToken: signInRes.body.sessionToken });
        const signOutRes = await client.post('/api/v1/auth/sign-out');
        expect(signOutRes.status).toBe(200);
        expect(signOutRes.body.success).toBe(true);
        const meRes = await client.get('/api/v1/auth/me');
        expect(meRes.status).toBe(401);
    });
});
