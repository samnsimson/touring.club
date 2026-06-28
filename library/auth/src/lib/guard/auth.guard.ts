import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AuthHeaders } from '../auth.headers';
import { getAuthAudience, getAuthIssuer, getAuthJwksUrl } from '../auth.constants';
import type { AuthenticatedRequest, AuthJwtPayload } from './auth.request';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    private static jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

    constructor(private readonly reflector: Reflector) {}

    static resetJwksCacheForTests(): void {
        AuthGuard.jwks = undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const handler = context.getHandler();
        const clazz = context.getClass();
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, clazz]);
        if (isPublic) return true;

        try {
            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const token = AuthHeaders.getAccessToken(request);
            if (!token) throw new UnauthorizedException('Missing authentication token');
            Object.assign(request, { session: await this.validateAuthToken(token) });
        } catch {
            throw new UnauthorizedException('Invalid or expired authentication token');
        }
        return true;
    }

    private getJwks() {
        if (!AuthGuard.jwks) AuthGuard.jwks = createRemoteJWKSet(getAuthJwksUrl());
        return AuthGuard.jwks;
    }

    private async validateAuthToken(token: string): Promise<AuthJwtPayload> {
        const issuer = getAuthIssuer();
        const audience = getAuthAudience();
        const { payload } = await jwtVerify(token, this.getJwks(), { issuer, audience });
        return payload as AuthJwtPayload;
    }
}
