import fs from 'node:fs';
import path from 'node:path';
import type { CapturedEmail, WaitForEmailOptions } from './testing.contracts';

export function resolveCaptureDir(captureDir?: string): string | undefined {
    if (!captureDir) return undefined;
    return path.isAbsolute(captureDir) ? captureDir : path.resolve(process.cwd(), captureDir);
}

export function clearCapturedEmails(captureDir: string): void {
    fs.mkdirSync(captureDir, { recursive: true });
    for (const entry of fs.readdirSync(captureDir)) {
        if (entry.endsWith('.json')) {
            fs.unlinkSync(path.join(captureDir, entry));
        }
    }
}

export function readCapturedEmails(captureDir: string): CapturedEmail[] {
    if (!fs.existsSync(captureDir)) return [];

    return fs
        .readdirSync(captureDir)
        .filter((entry) => entry.endsWith('.json'))
        .map((entry) => {
            const raw = fs.readFileSync(path.join(captureDir, entry), 'utf8');
            return JSON.parse(raw) as CapturedEmail;
        })
        .sort((left, right) => left.capturedAt.localeCompare(right.capturedAt));
}

export function findCapturedEmail(captureDir: string, options: WaitForEmailOptions): CapturedEmail | undefined {
    return readCapturedEmails(captureDir).find((email) => {
        if (options.to && email.to !== options.to) return false;
        if (options.subjectIncludes && !email.subject.includes(options.subjectIncludes)) return false;
        return true;
    });
}

export async function waitForCapturedEmail(
    captureDir: string,
    options: WaitForEmailOptions,
    pollIntervalMs: number,
    pollTimeoutMs: number,
): Promise<CapturedEmail> {
    const timeoutMs = options.timeoutMs ?? pollTimeoutMs;
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        const email = findCapturedEmail(captureDir, options);
        if (email) return email;
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error(`Timed out waiting for captured email (${JSON.stringify(options)})`);
}

export function extractOtpFromEmail(text: string): string | undefined {
    const match = text.match(/\b(\d{6})\b/);
    return match?.[1];
}

export function extractResetTokenFromEmail(text: string): string | undefined {
    const tokenMatch = text.match(/enter this token:\s*(\S+)/i);
    return tokenMatch?.[1];
}
