import path from 'node:path';
import { clearCapturedEmails, extractOtpFromEmail, extractResetTokenFromEmail, resolveCaptureDir, waitForCapturedEmail } from './email-capture';
import { interpolateFixture, loadFixture } from './fixture-utils';
import { redactSnapshotValue } from './snapshot-utils';
import type { CapturedEmail, E2ETestingEngineOptions, FixtureContext, WaitForEmailOptions } from './testing.contracts';

const DEFAULT_FIXTURES_DIR = 'fixtures';
const DEFAULT_EMAIL_CAPTURE_DIR = '.tmp/e2e-email-capture';
const DEFAULT_POLL_INTERVAL_MS = 200;
const DEFAULT_POLL_TIMEOUT_MS = 5_000;

export class E2ETestingEngine {
    private readonly fixturesDir: string;
    private readonly emailCaptureDir?: string;
    private readonly pollIntervalMs: number;
    private readonly pollTimeoutMs: number;
    private readonly redactKeys: string[];

    constructor(options: E2ETestingEngineOptions = {}) {
        this.fixturesDir = path.resolve(process.cwd(), options.fixturesDir ?? DEFAULT_FIXTURES_DIR);
        this.emailCaptureDir = resolveCaptureDir(options.emailCaptureDir ?? process.env.EMAIL_CAPTURE_DIR ?? DEFAULT_EMAIL_CAPTURE_DIR);
        this.pollIntervalMs = options.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
        this.pollTimeoutMs = options.pollTimeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
        this.redactKeys = options.redactKeys ?? ['accessToken', 'sessionToken', 'token', 'id', 'createdAt', 'updatedAt', 'otp'];
    }

    loadFixture<T>(name: string): T {
        return loadFixture<T>(this.fixturesDir, name);
    }

    buildFixture<T>(name: string, vars: Record<string, string>): T {
        return interpolateFixture(this.loadFixture<T>(name), vars);
    }

    redact<T>(value: T): T {
        return redactSnapshotValue(value, this.redactKeys) as T;
    }

    matchSnapshot(snapshotName: string, value: unknown): void {
        expect(this.redact(value)).toMatchSnapshot(snapshotName);
    }

    clearCapturedEmails(): void {
        if (!this.emailCaptureDir) return;
        clearCapturedEmails(this.emailCaptureDir);
    }

    async waitForEmail(options: WaitForEmailOptions): Promise<CapturedEmail> {
        if (!this.emailCaptureDir) {
            throw new Error('EMAIL_CAPTURE_DIR is not configured');
        }
        return waitForCapturedEmail(this.emailCaptureDir, options, this.pollIntervalMs, this.pollTimeoutMs);
    }

    extractOtp(text: string): string | undefined {
        return extractOtpFromEmail(text);
    }

    extractResetToken(text: string): string | undefined {
        return extractResetTokenFromEmail(text);
    }

    async useFixture<T>(name: string, vars: Record<string, string>, test: (ctx: FixtureContext<T>) => void | Promise<void>): Promise<void> {
        const fixture = this.buildFixture<T>(name, vars);
        await test({ fixture, vars });
    }
}

export const defaultEmailCaptureDir = (): string => resolveCaptureDir(process.env.EMAIL_CAPTURE_DIR ?? DEFAULT_EMAIL_CAPTURE_DIR)!;
