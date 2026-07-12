'use server';

import { extractAuthErrorMessage, resetPassword } from '@/lib/auth-service-client';

export interface ResetPasswordInput {
    newPassword: string;
    token: string;
}

export interface ResetPasswordResult {
    error?: string;
}

export async function resetPasswordAction(input: ResetPasswordInput): Promise<ResetPasswordResult> {
    const { data, error } = await resetPassword({ body: input });

    if (!data) {
        return { error: extractAuthErrorMessage(error, 'That reset link is invalid or has expired.') };
    }

    return {};
}
