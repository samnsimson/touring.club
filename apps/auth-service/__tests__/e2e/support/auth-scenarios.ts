import { type E2EApi } from '@tc/testing';
import { createAuthE2EApi, uniqueId, withAuthHeaders } from './auth-client';

export type VerifiedUser = {
    email: string;
    password: string;
    username: string;
    accessToken: string;
    sessionToken: string;
};

export function requireDatabase(testName: string): boolean {
    if (process.env.DATABASE_URL) return true;
    console.warn(`Skipping ${testName}: DATABASE_URL is not set`);
    return false;
}

export function createUserCredentials(): { email: string; password: string; username: string } {
    const suffix = uniqueId();
    const [, randomPart = Math.random().toString(36).slice(2, 8)] = suffix.split('-');
    return { email: `e2e-${suffix}@touring.club.test`, password: 'Str0ngPass!', username: `e2e${randomPart}` };
}

export async function signUpUser(api: E2EApi, credentials: Pick<VerifiedUser, 'email' | 'password' | 'username'>) {
    const response = await api.post('/api/v1/auth/sign-up', { name: 'E2E User', rememberMe: true, ...credentials });
    expect([200, 201]).toContain(response.status);
    expect(response.body.email).toBe(credentials.email);
    return response;
}

export async function verifyUserEmail(api: E2EApi, email: string) {
    const verificationEmail = await api.emailCapture.waitFor({ to: email, subjectIncludes: 'verification code' });
    const otp = api.emailCapture.extractOtp(verificationEmail.text);
    expect(otp).toBeDefined();

    const response = await api.post('/api/v1/auth/verify-email', { email, otp });
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.sessionToken).toBeDefined();
    return response;
}

export async function createVerifiedUser(api: E2EApi = createAuthE2EApi()): Promise<VerifiedUser> {
    const credentials = createUserCredentials();
    await signUpUser(api, credentials);
    const verifyRes = await verifyUserEmail(api, credentials.email);
    return { ...credentials, accessToken: verifyRes.body.accessToken, sessionToken: verifyRes.body.sessionToken };
}

export async function signInUser(api: E2EApi, { email, password }: Pick<VerifiedUser, 'email' | 'password'>) {
    const response = await api.post('/api/v1/auth/sign-in', { email, password });
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.sessionToken).toBeDefined();
    return response;
}

export function authedApi(user: Pick<VerifiedUser, 'accessToken' | 'sessionToken'>): E2EApi {
    return withAuthHeaders(createAuthE2EApi(), user.accessToken, user.sessionToken);
}
