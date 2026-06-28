import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthHeaders, IS_PUBLIC_KEY } from '@tc/auth';

/** E2e guard: treats `Authorization: Bearer <userId>` as an authenticated session. */
@Injectable()
export class MockAuthGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = AuthHeaders.getAccessToken(request) ?? AuthHeaders.getSessionToken(request);
        if (!token) throw new UnauthorizedException('Missing authentication token');

        Object.assign(request, { session: { sub: token, userId: token } });
        return true;
    }
}
