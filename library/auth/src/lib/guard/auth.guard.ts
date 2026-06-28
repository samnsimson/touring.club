import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthHeaders } from '../auth.headers';
import { verifyAuthToken } from '../auth.token';
import type { AuthenticatedRequest } from './auth.request';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const handler = context.getHandler();
        const clazz = context.getClass();
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, clazz]);
        if (isPublic) return true;

        try {
            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const token = AuthHeaders.getAccessToken(request);
            if (!token) throw new UnauthorizedException('Missing authentication token');
            Object.assign(request, { session: await verifyAuthToken(token) });
        } catch {
            throw new UnauthorizedException('Invalid or expired authentication token');
        }
        return true;
    }
}
