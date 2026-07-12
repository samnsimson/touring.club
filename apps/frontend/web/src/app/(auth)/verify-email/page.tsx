import { AuthCard } from '@tc/ui';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';

export const metadata = {
    title: 'Verify your email — touring.club',
};

export default function VerifyEmailPage() {
    return (
        <AuthCard title="Verify your email" description="Enter the 6-digit code we sent to your inbox.">
            <VerifyEmailForm />
        </AuthCard>
    );
}
