import type { EmailProvider, SendEmailInput } from './email.contract';

export class ConsoleEmailProvider implements EmailProvider {
    async send(input: SendEmailInput): Promise<void> {
        console.log(`[email] to=${input.to} subject="${input.subject}"\n${input.text}`);
    }
}
