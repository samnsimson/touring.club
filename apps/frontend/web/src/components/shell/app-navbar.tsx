'use client';

import { signOut, useSession } from 'next-auth/react';
import { Navbar } from '@tc/ui';
import { useNotificationsStore } from '@tc/state';

export function AppNavbar() {
    const { data: session, status } = useSession();
    const unreadCount = useNotificationsStore((state) => state.notifications.filter((notification) => !notification.read).length);

    return (
        <Navbar
            isAuthenticated={status === 'authenticated'}
            userName={session?.user?.name ?? undefined}
            userAvatarUrl={session?.user?.image ?? undefined}
            unreadNotificationCount={unreadCount}
            onSignOut={() => signOut({ callbackUrl: '/' })}
        />
    );
}
