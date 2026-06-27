import type { EmailProvider, SendEmailInput } from './email.types';

export class ResendEmailProvider implements EmailProvider {
    constructor(
        private readonly apiKey: string,
        private readonly from: string,
    ) {}

    async send(input: SendEmailInput): Promise<void> {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: this.from,
                to: [input.to],
                subject: input.subject,
                text: input.text,
                html: input.html,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error(`[email] Resend API error (${response.status}): ${body}`);
            throw new Error(`Failed to send email via Resend (${response.status})`);
        }
    }
}
