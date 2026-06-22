export const AUTH_BASE_URL = 'http://localhost:3000';
export const AUTH_BASE_PATH = '/api/auth';

export const getAuthIssuer = (): string => AUTH_BASE_URL;

export const getAuthAudience = (): string => AUTH_BASE_URL;

export const getAuthJwksUrl = (): URL => new URL(`${AUTH_BASE_PATH}/jwks`, AUTH_BASE_URL);
