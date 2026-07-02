import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest, AuthJwtPayload } from '../contracts/auth.contract';
import { AuthUtils } from '../utils/auth.utils';

type SessionFactoryResponse = AuthJwtPayload | AuthJwtPayload[keyof AuthJwtPayload];

export function currentSessionFactory(key: keyof AuthJwtPayload | undefined, context: ExecutionContext): SessionFactoryResponse {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const session = request.session;
    if (!session || typeof session !== 'object') throw new UnauthorizedException('Not authenticated');
    if (!key) return session;
    if (key === 'userId') return AuthUtils.resolveSessionUserId(session);
    return session[key];
}

export const CurrentSession = createParamDecorator(currentSessionFactory);
