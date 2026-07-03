import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { Auth } from '../config/auth.config';
import { AuthHeaders } from '../utils/auth.headers';
import { AuthenticatedRequest } from '../contracts/auth.contract';
import { AuthUtils } from '../utils/auth.utils';

@Injectable()
export class HybridAuthGuard implements CanActivate {
    private readonly logger = new Logger(HybridAuthGuard.name);

    constructor(
        @Inject(Reflector) private readonly reflector: Reflector,
        @Inject(AuthService) private readonly authService: AuthService<Auth>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            if (AuthUtils.isPublicRequest(context, this.reflector)) return true;
            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const kongSessionToken = AuthUtils.getSessionTokenFromKong(request);
            if (kongSessionToken) return AuthUtils.guardKongRequest(request, kongSessionToken, this.authService);
            const token = AuthHeaders.getAccessToken(request);
            if (token) return AuthUtils.guardStandaloneRequest(request, token, this.authService);
            throw new UnauthorizedException('Unauthorized');
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
}
