import type { Request } from 'express';
import type { JWTPayload } from 'jose';
import { UnauthorizedException } from '@nestjs/common';

export type AuthJwtPayload = JWTPayload & {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
    banned?: boolean;
    banExpires?: Date | string;
};

export function resolveSessionUserId(session: AuthJwtPayload): string {
    const userId = typeof session.userId === 'string' ? session.userId : session.sub;
    if (!userId || typeof userId !== 'string') throw new UnauthorizedException('Not authenticated');
    return userId;
}

export type AuthenticatedRequest = Request & {
    session?: AuthJwtPayload;
};
