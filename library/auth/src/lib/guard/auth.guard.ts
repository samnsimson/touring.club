import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getAuthAudience, getAuthIssuer, getAuthJwksUrl } from '../auth.constants';
import type { AuthenticatedRequest, AuthJwtPayload } from './auth.request';

@Injectable()
export class AuthGuard implements CanActivate {
    private static readonly bearerScheme = 'bearer ';
    private static readonly sessionCookieNames = ['better-auth.session_token', '__Secure-better-auth.session_token'] as const;
    private static jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const token = this.extractAuthToken(request);
            if (!token) throw new UnauthorizedException('Missing authentication token');
            Object.assign(request, { session: await this.validateAuthToken(token) });
            return true;
        } catch {
            throw new UnauthorizedException('Invalid or expired authentication token');
        }
    }

    private extractAuthToken(request: AuthenticatedRequest): string | undefined {
        const authorization = request.headers.authorization;

        if (authorization?.toLowerCase().startsWith(AuthGuard.bearerScheme)) {
            const token = authorization.slice(AuthGuard.bearerScheme.length).trim();
            if (token) return token;
        }

        for (const cookieName of AuthGuard.sessionCookieNames) {
            const cookieToken = request.cookies?.[cookieName];
            if (typeof cookieToken === 'string' && cookieToken) return cookieToken;
        }

        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) return undefined;

        for (const cookieName of AuthGuard.sessionCookieNames) {
            const cookieToken = this.readCookie(cookieHeader, cookieName);
            if (cookieToken) return cookieToken;
        }

        return undefined;
    }

    private readCookie(cookieHeader: string, name: string): string | undefined {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`));
        if (!match?.[1]) return undefined;
        return decodeURIComponent(match[1]);
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
