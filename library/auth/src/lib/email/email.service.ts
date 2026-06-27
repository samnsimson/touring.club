import type { Env } from '@tc/config';
import { CaptureEmailProvider } from './capture-email.provider';
import { ConsoleEmailProvider } from './console-email.provider';
import type { EmailProvider, SendEmailInput } from './email.types';
import { ResendEmailProvider } from './resend-email.provider';

export class EmailService {
    private readonly provider: EmailProvider;

    constructor(env: Pick<Env, 'EMAIL_PROVIDER' | 'EMAIL_CAPTURE_DIR' | 'RESEND_API_KEY' | 'EMAIL_FROM'>) {
        if (env.EMAIL_PROVIDER === 'capture' && env.EMAIL_CAPTURE_DIR) {
            this.provider = new CaptureEmailProvider(env.EMAIL_CAPTURE_DIR);
        } else if (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY) {
            this.provider = new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
        } else {
            this.provider = new ConsoleEmailProvider();
        }
    }

    send(input: SendEmailInput): void {
        void this.provider.send(input).catch((error: unknown) => {
            console.error('Failed to send email', error);
        });
    }
}
