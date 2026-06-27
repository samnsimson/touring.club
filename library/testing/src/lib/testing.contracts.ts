export interface E2ETestingEngineOptions {
    fixturesDir?: string;
    snapshotsDir?: string;
    emailCaptureDir?: string;
    pollIntervalMs?: number;
    pollTimeoutMs?: number;
    redactKeys?: string[];
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

export interface FixtureContext<T> {
    fixture: T;
    vars: Record<string, string>;
}

export type SnapshotValue = Record<string, unknown> | unknown[] | string | number | boolean | null;
