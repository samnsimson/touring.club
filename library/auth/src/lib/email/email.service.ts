import type { Env } from '@tc/config';
import { ConsoleEmailProvider } from './console-email.provider';
import type { EmailProvider, SendEmailInput } from './email.types';
import { ResendEmailProvider } from './resend-email.provider';

export class EmailService {
    private readonly provider: EmailProvider;

    constructor(env: Pick<Env, 'EMAIL_PROVIDER' | 'RESEND_API_KEY' | 'EMAIL_FROM'>) {
        this.provider =
            env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY ? new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM) : new ConsoleEmailProvider();
    }

    send(input: SendEmailInput): void {
        void this.provider.send(input).catch((error: unknown) => {
            console.error('Failed to send email', error);
        });
    }
}
