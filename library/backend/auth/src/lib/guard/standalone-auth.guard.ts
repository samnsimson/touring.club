import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Auth } from '../config/auth.config';
import { IS_PUBLIC_KEY } from '../decorators';
import { AuthHeaders } from '../utils/auth.headers';
import { AuthUtils } from '../utils/auth.utils';
import { AuthenticatedRequest } from '../contracts/auth.contract';

@Injectable()
export class StandaloneAuthGuard implements CanActivate {
    private readonly logger = new Logger(StandaloneAuthGuard.name);

    constructor(
        @Inject(Reflector) private readonly reflector: Reflector,
        private readonly authService: AuthService<Auth>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const handler = context.getHandler();
            const clazz = context.getClass();
            const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, clazz]);
            if (isPublic) return true;

            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const token = AuthHeaders.getAccessToken(request);
            if (!token) throw new UnauthorizedException('Missing authentication token');

            const tokenPayload = await AuthUtils.verifyAuthToken(token);
            const headers = new Headers({ Authorization: `Bearer ${tokenPayload}` });
            const sessionData = await this.authService.api.getSession({ headers });
            if (!sessionData) throw new UnauthorizedException('Session is not valid or expired');
            Object.assign(request, { session: sessionData.session, user: sessionData.user });
            return true;
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
