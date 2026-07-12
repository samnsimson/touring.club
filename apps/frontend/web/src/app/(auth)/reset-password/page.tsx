import { AuthCard } from '@tc/ui';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
    title: 'Reset your password — touring.club',
};

export default function ResetPasswordPage() {
    return (
        <AuthCard title="Choose a new password" description="Enter a new password for your account.">
            <ResetPasswordForm />
        </AuthCard>
    );
}
