import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getAuthAudience, getAuthIssuer, getAuthJwksUrl } from './auth.constants';
import type { AuthJwtPayload } from './guard/auth.request';

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJwks() {
    if (!jwks) jwks = createRemoteJWKSet(getAuthJwksUrl());
    return jwks;
}

export function resetAuthTokenJwksCacheForTests(): void {
    jwks = undefined;
}

export async function verifyAuthToken(token: string): Promise<AuthJwtPayload> {
    const { payload } = await jwtVerify(token, getJwks(), { issuer: getAuthIssuer(), audience: getAuthAudience() });
    return payload as AuthJwtPayload;
}
