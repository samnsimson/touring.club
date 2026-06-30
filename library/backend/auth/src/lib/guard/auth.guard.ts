import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthHeaders } from '../auth.headers';
import { verifyAuthToken } from '../auth.token';
import type { AuthenticatedRequest } from './auth.request';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
    /** `@Inject(Reflector)` is required here — esbuild's TS transform elides `Reflector` as a type-only
     *  import since it's never used as a value, so `emitDecoratorMetadata` has no `design:paramtypes` to
     *  resolve and DI silently leaves this param `undefined`. An explicit token sidesteps that. */
    constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

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
