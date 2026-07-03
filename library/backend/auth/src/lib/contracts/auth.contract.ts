import { ModuleMetadata } from '@nestjs/common';
import { JWTPayload } from 'jose';
import { Socket } from 'socket.io';
import { Request } from 'express';
import type { SendEmailInput } from '../email/email.types';

export type EmailSender = {
    send(input: SendEmailInput): void;
};

export interface AuthConfig {
    isGlobal?: boolean;
}

export interface AuthModuleOptions {
    emailService?: EmailSender;
    imports?: ModuleMetadata['imports'];
    providers?: ModuleMetadata['providers'];
    exports?: ModuleMetadata['exports'];
}

export type AuthenticatedSocket = Socket & {
    data: { userId?: string };
};

export type AuthJwtPayload = JWTPayload & {
    userId?: string;
    email?: string;
    name?: string;
    role?: string;
    banned?: boolean;
    banExpires?: Date | string;
    /** The raw Better Auth session token embedded by the JWT plugin — required to look up the session via `authService.api.getSession()`, since that call expects the raw session token, not the signed JWT. */
    token?: string;
};

export type AuthenticatedRequest = Request & {
    session?: AuthJwtPayload;
};
