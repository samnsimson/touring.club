import { createAuthE2EApi } from './support/auth-client';
import { createUserCredentials, requireDatabase, signUpUser, verifyUserEmail } from './support/auth-scenarios';

describe('Auth registration', () => {
    const api = createAuthE2EApi();

    beforeEach(() => {
        api.emailCapture.clear();
    });

    it('POST /api/v1/auth/sign-up creates a pending user', async () => {
        if (!requireDatabase('sign-up')) return;
        const credentials = createUserCredentials();
        await signUpUser(api, credentials);
    });

    it('POST /api/v1/auth/verify-email verifies a new user and issues tokens', async () => {
        if (!requireDatabase('verify-email')) return;
        const credentials = createUserCredentials();
        await signUpUser(api, credentials);
        await verifyUserEmail(api, credentials.email);
    });
});
