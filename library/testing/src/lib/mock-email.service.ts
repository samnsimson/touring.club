import type { CapturedEmail, MockEmailInput, WaitForEmailOptions } from './testing.contracts';

export class MockEmailService {
    private emails: CapturedEmail[] = [];
    private readonly pollIntervalMs: number;
    private readonly pollTimeoutMs: number;

    readonly send = jest.fn((input: MockEmailInput): void => {
        this.emails.push({ ...input, capturedAt: new Date().toISOString() });
    });

    constructor(options: { pollIntervalMs?: number; pollTimeoutMs?: number } = {}) {
        this.pollIntervalMs = options.pollIntervalMs ?? 200;
        this.pollTimeoutMs = options.pollTimeoutMs ?? 5_000;
    }

    clear(): void {
        this.emails = [];
        this.send.mockClear();
    }

    readAll(): CapturedEmail[] {
        return [...this.emails];
    }

    find(options: WaitForEmailOptions): CapturedEmail | undefined {
        return this.emails.find((email) => {
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
        throw new Error(`Timed out waiting for email (${JSON.stringify(options)})`);
    }

    extractOtp(text: string): string | undefined {
        return text.match(/\b(\d{6})\b/)?.[1];
    }

    extractResetToken(text: string): string | undefined {
        return text.match(/enter this token:\s*(\S+)/i)?.[1];
    }
}
