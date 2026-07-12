import { AuthCard } from '@tc/ui';
import { LoginForm } from '@/components/auth/login-form';

export const metadata = {
    title: 'Sign in — touring.club',
};

export default function LoginPage() {
    return (
        <AuthCard title="Welcome back" description="Sign in to keep planning your next trip.">
            <LoginForm />
        </AuthCard>
    );
}
