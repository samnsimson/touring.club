import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { EmailProvider, SendEmailInput } from './email.types';

export type CapturedEmail = SendEmailInput & {
    capturedAt: string;
};

export class CaptureEmailProvider implements EmailProvider {
    constructor(private readonly captureDir: string) {
        fs.mkdirSync(this.captureDir, { recursive: true });
    }

    async send(input: SendEmailInput): Promise<void> {
        const captured: CapturedEmail = {
            ...input,
            capturedAt: new Date().toISOString(),
        };
        const filePath = path.join(this.captureDir, `${Date.now()}-${randomUUID()}.json`);
        fs.writeFileSync(filePath, JSON.stringify(captured, null, 2), 'utf8');
        console.log(`[email-capture] to=${input.to} subject="${input.subject}" -> ${filePath}`);
    }
}
