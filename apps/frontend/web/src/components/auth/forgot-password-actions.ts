'use server';

import { forgotPassword } from '@/lib/auth-service-client';

export interface ForgotPasswordInput {
    email: string;
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<void> {
    const redirectTo = `${process.env.AUTH_URL}/reset-password`;
    await forgotPassword({ body: { email: input.email, redirectTo } });
}
