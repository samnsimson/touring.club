import { Settings } from 'lucide-react';
import { AppEmptyState, PageHeader } from '@tc/ui';

export const metadata = {
    title: 'Settings — touring.club',
};

export default function SettingsPage() {
    return (
        <>
            <PageHeader title="Settings" description="Manage your account and privacy settings." />
            <AppEmptyState
                icon={<Settings size={32} />}
                title="Settings are coming soon"
                description="Password changes, notification preferences, and privacy controls will land here once account settings are wired up to auth-service."
            />
        </>
    );
}
