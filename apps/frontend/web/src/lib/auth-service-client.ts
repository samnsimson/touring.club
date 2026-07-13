import { clientApi } from './client-api';

const authServiceSdk = clientApi.authService;

export const signIn = authServiceSdk.signIn.bind(authServiceSdk);
export const signUp = authServiceSdk.signUp.bind(authServiceSdk);
export const verifyEmail = authServiceSdk.verifyEmail.bind(authServiceSdk);
export const forgotPassword = authServiceSdk.forgotPassword.bind(authServiceSdk);
export const resetPassword = authServiceSdk.resetPassword.bind(authServiceSdk);

export function extractAuthErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string') return message;
        if (Array.isArray(message) && message.every((entry) => typeof entry === 'string')) return message.join(', ');
    }
    return fallback;
}
