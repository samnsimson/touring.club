import { HttpClient, isHttpError } from '@tc/common';
import type { EmailProvider, SendEmailInput } from './email.types';

export class ResendEmailProvider implements EmailProvider {
    constructor(
        private readonly http: HttpClient,
        private readonly apiKey: string,
        private readonly from: string,
    ) {}

    async send(input: SendEmailInput): Promise<void> {
        try {
            await this.http.post(
                'https://api.resend.com/emails',
                {
                    from: this.from,
                    to: [input.to],
                    subject: input.subject,
                    text: input.text,
                    html: input.html,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
        } catch (error) {
            if (isHttpError(error) && error.response) {
                const body = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
                console.error(`[email] Resend API error (${error.response.status}): ${body}`);
                throw new Error(`Failed to send email via Resend (${error.response.status})`);
            }
            throw error;
        }
    }
}
