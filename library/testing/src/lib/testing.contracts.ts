import type { Server } from 'node:http';
import type { Application } from 'express';

export type E2ERequestTarget = string | Server | Application;

export interface E2EApiOptions {
    server: E2ERequestTarget;
    headers?: Record<string, string>;
    fixturesDir?: string;
    emailCaptureDir?: string;
}

export interface RequestFixtureLoaderOptions {
    fixturesDir?: string;
}

export interface EmailCaptureOptions {
    captureDir?: string;
    pollIntervalMs?: number;
    pollTimeoutMs?: number;
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
