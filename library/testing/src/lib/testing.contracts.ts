import type { Type } from '@nestjs/common';
import type { CanActivate } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Server } from 'node:http';
import type { Application } from 'express';

export interface MockEmailInput {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export interface E2EApplicationOptions {
    rootModule: Type<unknown>;
    globalPrefix?: string;
    fixturesDir?: string;
    /** Overrides the global AuthGuard for in-process e2e (session validation instead of remote JWKS). */
    authGuard?: Type<CanActivate>;
    /** Overrides WsAuthGuard for in-process WebSocket e2e (session validation instead of remote JWKS). */
    wsAuthGuard?: Type<CanActivate>;
    /** When set, the app listens on this URL so remote JWKS validation (AuthGuard) or a real WebSocket client can reach the in-process server. */
    listenUrl?: string;
    configure?: (app: NestExpressApplication) => void | Promise<void>;
}

export type E2ERequestTarget = string | Server | Application;

export interface E2EApiOptions {
    server: E2ERequestTarget;
    headers?: Record<string, string>;
    fixturesDir?: string;
}

export interface RequestFixtureLoaderOptions {
    fixturesDir?: string;
}

export interface CapturedEmail {
    to: string;
    subject: string;
    text: string;
    html?: string;
    capturedAt: string;
}

export interface WaitForEmailOptions {
    to?: string;
    subjectIncludes?: string;
    timeoutMs?: number;
}

export interface SnapshotRedactorOptions {
    keys?: string[];
}
