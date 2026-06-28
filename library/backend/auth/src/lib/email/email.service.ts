import type { Env } from '@tc/config';
import { HttpClient } from '@tc/common';
import { ConsoleEmailProvider } from './console-email.provider';
import type { EmailProvider, SendEmailInput } from './email.types';
import { ResendEmailProvider } from './resend-email.provider';

export class EmailService {
    private readonly provider: EmailProvider;

    constructor(env: Pick<Env, 'EMAIL_PROVIDER' | 'RESEND_API_KEY' | 'EMAIL_FROM'>, http?: HttpClient) {
        if (env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY) {
            if (!http) {
                throw new Error('HttpClient is required when EMAIL_PROVIDER=resend');
            }
            this.provider = new ResendEmailProvider(http, env.RESEND_API_KEY, env.EMAIL_FROM);
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
