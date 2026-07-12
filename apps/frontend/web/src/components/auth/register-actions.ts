'use server';

import { extractAuthErrorMessage, signUp } from '@/lib/auth-service-client';

export interface RegisterInput {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface RegisterResult {
    error?: string;
}

export async function registerAction(input: RegisterInput): Promise<RegisterResult> {
    const { data, error } = await signUp({ body: input });

    if (!data) {
        return { error: extractAuthErrorMessage(error, 'Could not create your account. That email or username may already be taken.') };
    }

    return {};
}
