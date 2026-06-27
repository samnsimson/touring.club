import fs from 'node:fs';
import path from 'node:path';
import type { CapturedEmail, EmailCaptureOptions, WaitForEmailOptions } from './testing.contracts';

export class EmailCapture {
    static readonly defaultCaptureDir = '.tmp/e2e-email-capture';

    private readonly captureDir: string;
    private readonly pollIntervalMs: number;
    private readonly pollTimeoutMs: number;

    constructor(options: EmailCaptureOptions = {}) {
        this.captureDir = EmailCapture.resolveCaptureDir(options.captureDir);
        this.pollIntervalMs = options.pollIntervalMs ?? 200;
        this.pollTimeoutMs = options.pollTimeoutMs ?? 5_000;
    }

    static resolveCaptureDir(captureDir?: string): string {
        const dir = captureDir ?? process.env.EMAIL_CAPTURE_DIR ?? EmailCapture.defaultCaptureDir;
        return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
    }

    getCaptureDir(): string {
        return this.captureDir;
    }

    clear(): void {
        fs.mkdirSync(this.captureDir, { recursive: true });
        for (const entry of fs.readdirSync(this.captureDir)) {
            if (entry.endsWith('.json')) {
                fs.unlinkSync(path.join(this.captureDir, entry));
            }
        }
    }

    readAll(): CapturedEmail[] {
        if (!fs.existsSync(this.captureDir)) return [];
        return fs
            .readdirSync(this.captureDir)
            .filter((entry) => entry.endsWith('.json'))
            .map((entry) => JSON.parse(fs.readFileSync(path.join(this.captureDir, entry), 'utf8')) as CapturedEmail)
            .sort((left, right) => left.capturedAt.localeCompare(right.capturedAt));
    }

    find(options: WaitForEmailOptions): CapturedEmail | undefined {
        return this.readAll().find((email) => {
            if (options.to && email.to !== options.to) return false;
            if (options.subjectIncludes && !email.subject.includes(options.subjectIncludes)) return false;
            return true;
        });
    }

    async waitFor(options: WaitForEmailOptions): Promise<CapturedEmail> {
        const timeoutMs = options.timeoutMs ?? this.pollTimeoutMs;
        const startedAt = Date.now();
        while (Date.now() - startedAt < timeoutMs) {
            const email = this.find(options);
            if (email) return email;
            await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
        }
        throw new Error(`Timed out waiting for captured email (${JSON.stringify(options)})`);
    }

    extractOtp(text: string): string | undefined {
        return text.match(/\b(\d{6})\b/)?.[1];
    }

    extractResetToken(text: string): string | undefined {
        return text.match(/enter this token:\s*(\S+)/i)?.[1];
    }
}
