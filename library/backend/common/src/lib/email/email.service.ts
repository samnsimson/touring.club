import { Injectable } from '@nestjs/common';
import { ConfigService } from '@tc/config';
import { HttpClient } from '../http';
import { ConsoleEmailProvider } from './console-email.provider';
import type { EmailProvider, SendEmailInput } from './email.contract';
import { ResendEmailProvider } from './resend-email.provider';

@Injectable()
export class EmailService {
    private readonly provider: EmailProvider;

    constructor(config: ConfigService, http?: HttpClient) {
        const emailProvider = config.get('EMAIL_PROVIDER');
        const resendApiKey = config.get('RESEND_API_KEY');
        if (emailProvider === 'resend' && resendApiKey) {
            if (!http) {
                throw new Error('HttpClient is required when EMAIL_PROVIDER=resend');
            }
            this.provider = new ResendEmailProvider(http, resendApiKey, config.get('EMAIL_FROM'));
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
