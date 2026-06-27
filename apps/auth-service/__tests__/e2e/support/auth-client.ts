import type { E2EApi } from '@tc/testing';
import { getAuthE2EApi } from './create-e2e-app';

export const AUTH_E2E_EMAIL_CAPTURE_DIR = process.env.EMAIL_CAPTURE_DIR ?? 'apps/auth-service/.tmp/e2e-email-capture';
const AUTH_ACCESS_TOKEN_COOKIE = 'access-token';
const AUTH_REFRESH_TOKEN_COOKIE = 'refresh-token';

export function createAuthE2EApi(): E2EApi {
    return getAuthE2EApi();
}

export function withAuthHeaders(api: E2EApi, accessToken: string, sessionToken: string): E2EApi {
    return api
        .setHeader('Authorization', `Bearer ${sessionToken}`)
        .setHeader('Cookie', `${AUTH_REFRESH_TOKEN_COOKIE}=${sessionToken}; ${AUTH_ACCESS_TOKEN_COOKIE}=${accessToken}`);
}

export const uniqueId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
