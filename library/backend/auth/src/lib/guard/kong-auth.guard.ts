import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest } from '../contracts/auth.contract';
import { AuthUtils } from '../utils/auth.utils';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Auth } from '../config/auth.config';

@Injectable()
export class KongAuthGuard implements CanActivate {
    private readonly logger = new Logger(KongAuthGuard.name);

    constructor(
        @Inject(Reflector) private readonly reflector: Reflector,
        private readonly authService: AuthService<Auth>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            if (AuthUtils.isPublicRequest(context, this.reflector)) return true;
            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const sessionToken = AuthUtils.getSessionTokenFromKong(request);
            if (!sessionToken) throw new UnauthorizedException('Missing Kong authentication headers');
            const headers = new Headers({ Authorization: `Bearer ${sessionToken}` });
            const sessionData = await this.authService.api.getSession({ headers });
            if (!sessionData) throw new UnauthorizedException('Session expired or not valid');
            Object.assign(request, { session: sessionData.session, user: sessionData.user });
            return true;
        } catch (error) {
            this.logger.error(error);
            throw new UnauthorizedException('Unauthorized');
        }
    }
}
