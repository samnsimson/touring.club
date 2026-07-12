import { AuthCard } from '@tc/ui';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata = {
    title: 'Reset your password — touring.club',
};

export default function ForgotPasswordPage() {
    return (
        <AuthCard title="Forgot your password?" description="Enter your email and we'll send you a link to reset it.">
            <ForgotPasswordForm />
        </AuthCard>
    );
}
