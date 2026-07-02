import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { getAuthAudience, getAuthIssuer, getAuthJwksUrl } from '../constants/auth.constants';
import { Auth } from '../config/auth.config';
import { IS_PUBLIC_KEY } from '../decorators';
import { AuthenticatedRequest, AuthJwtPayload } from '../contracts/auth.contract';

export class AuthUtils {
    private static jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

    private static getJwks() {
        if (!AuthUtils.jwks) AuthUtils.jwks = createRemoteJWKSet(getAuthJwksUrl());
        return AuthUtils.jwks;
    }

    static resetAuthTokenJwksCacheForTests(): void {
        AuthUtils.jwks = undefined;
    }

    static async verifyAuthToken(token: string): Promise<AuthJwtPayload> {
        const { payload } = await jwtVerify(token, AuthUtils.getJwks(), { issuer: getAuthIssuer(), audience: getAuthAudience() });
        return payload as AuthJwtPayload;
    }

    static resolveSessionUserId(session: AuthJwtPayload): string {
        const userId = typeof session.userId === 'string' ? session.userId : session.sub;
        if (!userId || typeof userId !== 'string') throw new UnauthorizedException('Not authenticated');
        return userId;
    }

    static isPublicRequest(context: ExecutionContext, reflector: Reflector): boolean {
        const handler = context.getHandler();
        const clazz = context.getClass();
        const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, clazz]);
        return isPublic === true;
    }

    static getSessionTokenFromKong(request: AuthenticatedRequest): string | undefined {
        return request.headers['x-session-token'] as string | undefined;
    }

    static async guardKongRequest(request: AuthenticatedRequest, token: string, authService: AuthService<Auth>): Promise<boolean> {
        const headers = new Headers({ Authorization: `Bearer ${token}` });
        const sessionData = await authService.api.getSession({ headers });
        if (!sessionData) throw new UnauthorizedException('Session expired or not valid');
        Object.assign(request, { session: sessionData.session, user: sessionData.user });
        return true;
    }

    static async guardStandaloneRequest(request: AuthenticatedRequest, token: string, authService: AuthService<Auth>): Promise<boolean> {
        await AuthUtils.verifyAuthToken(token);
        const headers = new Headers({ Authorization: `Bearer ${token}` });
        const sessionData = await authService.api.getSession({ headers });
        if (!sessionData) throw new UnauthorizedException('Session expired or not valid');
        Object.assign(request, { session: sessionData.session, user: sessionData.user });
        return true;
    }
}
