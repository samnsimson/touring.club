import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthHeaders } from '../utils/auth.headers';
import { AuthUtils } from '../utils/auth.utils';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedRequest } from '../contracts/auth.contract';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);
    constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const handler = context.getHandler();
            const clazz = context.getClass();
            const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler, clazz]);
            if (isPublic) return true;

            const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
            const token = AuthHeaders.getAccessToken(request);
            if (!token) throw new UnauthorizedException('Missing authentication token');
            Object.assign(request, { session: await AuthUtils.verifyAuthToken(token) });
            return true;
        } catch (err) {
            this.logger.error(err);
            throw new UnauthorizedException('Invalid or expired authentication token');
        }
    }
}
