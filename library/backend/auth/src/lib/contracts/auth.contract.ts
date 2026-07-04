import { Type } from '@nestjs/common';
import { JWTPayload } from 'jose';
import { Socket } from 'socket.io';
import { Request } from 'express';
import type { EmailSender } from '@tc/common';
import { HybridAuthGuard, KongAuthGuard, StandaloneAuthGuard } from '../guard';

export interface AuthConfig {
    isGlobal?: boolean;
}

export interface AuthModuleOptions {
    emailService?: EmailSender;
    guard?: Type<HybridAuthGuard | StandaloneAuthGuard | KongAuthGuard>;
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
    token?: string;
};

export type AuthenticatedRequest = Request & {
    session?: AuthJwtPayload;
};
