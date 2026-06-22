import type { Request } from 'express';
import type { JWTPayload } from 'jose';

export type AuthJwtPayload = JWTPayload & {
    email?: string;
    name?: string;
    role?: string;
    banned?: boolean;
    banExpires?: Date | string;
};

export type AuthenticatedRequest = Request & {
    session?: AuthJwtPayload;
};
