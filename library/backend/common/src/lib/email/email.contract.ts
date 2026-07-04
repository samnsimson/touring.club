export type SendEmailInput = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

export type EmailProvider = {
    send(input: SendEmailInput): Promise<void>;
};

export type EmailSender = {
    send(input: SendEmailInput): void;
};

export interface EmailModuleOptions {
    global?: boolean;
}
