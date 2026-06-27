export type SendEmailInput = {
    to: string;
    subject: string;
    text: string;
    html?: string;
};

export type EmailProvider = {
    send(input: SendEmailInput): Promise<void>;
};
