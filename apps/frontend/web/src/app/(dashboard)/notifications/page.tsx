import { Bell } from 'lucide-react';
import { AppEmptyState, NotificationItem, PageHeader, Stack } from '@tc/ui';
import { currentUser, mockNotifications } from '@tc/mocks';

export const metadata = {
    title: 'Notifications — touring.club',
};

export default function NotificationsPage() {
    const notifications = mockNotifications
        .filter((notification) => notification.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <>
            <PageHeader title="Notifications" description="Join requests, approvals, messages, and trip updates." />
            {notifications.length > 0 ? (
                <Stack gap="2">
                    {notifications.map((notification) => (
                        <NotificationItem
                            key={notification.id}
                            href={notification.link}
                            title={notification.title}
                            body={notification.body}
                            createdAt={notification.createdAt}
                            read={notification.read}
                        />
                    ))}
                </Stack>
            ) : (
                <AppEmptyState icon={<Bell size={32} />} title="You're all caught up" description="New notifications will show up here." />
            )}
        </>
    );
}
