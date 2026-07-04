import { HttpClient, isHttpError } from '../http';
import type { EmailProvider, SendEmailInput } from './email.contract';

export class ResendEmailProvider implements EmailProvider {
    constructor(
        private readonly http: HttpClient,
        private readonly apiKey: string,
        private readonly from: string,
    ) {}

    async send(input: SendEmailInput): Promise<void> {
        try {
            const url = 'https://api.resend.com/emails';
            await this.http.post(
                url,
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
