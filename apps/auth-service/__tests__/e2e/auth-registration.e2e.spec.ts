import { E2EApplication, MockEmailService, requireDatabase, E2eSessionAuthGuard, type E2EApi } from '@tc/testing';
import { createUserCredentials, signUpUser, verifyUserEmail } from './support/auth-scenarios';
import { createAuthE2EAppModule } from './support/e2e-app.module';

const mockEmailService = new MockEmailService();
const e2eApplication = new E2EApplication({
    rootModule: createAuthE2EAppModule(mockEmailService),
    globalPrefix: 'api',
    authGuard: E2eSessionAuthGuard,
});

describe('Auth registration', () => {
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

    it('POST /api/v1/auth/sign-up creates a pending user', async () => {
        if (!requireDatabase('sign-up')) return;
        const credentials = createUserCredentials();
        await signUpUser(api, credentials);
    });

    it('POST /api/v1/auth/verify-email verifies a new user and issues tokens', async () => {
        if (!requireDatabase('verify-email')) return;
        const credentials = createUserCredentials();
        await signUpUser(api, credentials);
        await verifyUserEmail(api, mockEmailService, credentials.email);
    });
});
