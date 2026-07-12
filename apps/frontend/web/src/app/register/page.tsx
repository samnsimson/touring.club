import { AuthCard } from '@tc/ui';
import { RegisterForm } from './register-form';

export const metadata = {
    title: 'Create your account — touring.club',
};

export default function RegisterPage() {
    return (
        <AuthCard title="Create your account" description="Join touring.club to discover and organize group trips.">
            <RegisterForm />
        </AuthCard>
    );
}
