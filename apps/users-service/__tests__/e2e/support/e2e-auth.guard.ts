import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { Auth } from '@tc/auth';
import { AuthHeaders } from '@tc/auth';

@Injectable()
export class E2EAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService<Auth>) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
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
