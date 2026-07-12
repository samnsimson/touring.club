'use server';

import { extractAuthErrorMessage, verifyEmail } from '@/lib/auth-service-client';

export interface VerifyEmailInput {
    email: string;
    otp: string;
}

export interface VerifyEmailResult {
    error?: string;
}

export async function verifyEmailAction(input: VerifyEmailInput): Promise<VerifyEmailResult> {
    const { data, error } = await verifyEmail({ body: input });

    if (!data) {
        return { error: extractAuthErrorMessage(error, 'That code is invalid or has expired.') };
    }

    return {};
}
