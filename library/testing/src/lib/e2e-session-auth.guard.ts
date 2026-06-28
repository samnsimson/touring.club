import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { Auth } from '@tc/auth';
import { AuthHeaders, IS_PUBLIC_KEY } from '@tc/auth';

@Injectable()
export class E2eSessionAuthGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService<Auth>,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        if (!AuthHeaders.getSessionToken(request) && !AuthHeaders.getAccessToken(request)) {
            throw new UnauthorizedException('Missing authentication token');
        }

        const session = await this.authService.api.getSession({ headers: AuthHeaders.fromRequest(request) });
        if (!session?.user?.id) throw new UnauthorizedException('Invalid or expired authentication token');

        Object.assign(request, {
            session: {
                sub: session.user.id,
                userId: session.user.id,
                email: session.user.email,
                name: session.user.name,
            },
        });

        return true;
    }
}
