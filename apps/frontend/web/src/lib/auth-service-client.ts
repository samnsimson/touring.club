import { configureAuthServiceClient } from '@tc/client-api/services/auth-service';

configureAuthServiceClient({ baseUrl: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1` });

export { signIn, signUp, verifyEmail, forgotPassword, resetPassword } from '@tc/client-api/services/auth-service';

export function extractAuthErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string') return message;
        if (Array.isArray(message) && message.every((entry) => typeof entry === 'string')) return message.join(', ');
    }
    return fallback;
}
