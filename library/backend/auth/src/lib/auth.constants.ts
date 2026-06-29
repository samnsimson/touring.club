import { env } from './auth.datasource';

export const AUTH_BASE_URL = env.AUTH_APP_URL;
export const AUTH_BASE_PATH = '/api/auth';

export const AUTH_ACCESS_TOKEN_COOKIE = 'access-token';
export const AUTH_REFRESH_TOKEN_COOKIE = 'refresh-token';
export const AUTH_BETTER_AUTH_SESSION_COOKIES = ['better-auth.session_token', '__Secure-better-auth.session_token'] as const;

export const getAuthIssuer = (): string => AUTH_BASE_URL;

export const getAuthAudience = (): string => AUTH_BASE_URL;

export const getAuthJwksUrl = (): URL => new URL(`${AUTH_BASE_PATH}/jwks`, AUTH_BASE_URL);
