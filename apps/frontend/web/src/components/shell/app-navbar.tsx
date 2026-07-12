'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@tc/ui';
import { useNotificationsStore } from '@tc/state';

export function AppNavbar() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const unreadCount = useNotificationsStore((state) => state.notifications.filter((notification) => !notification.read).length);

    async function handleSignOut() {
        await signOut({ redirect: false });
        router.push('/');
        router.refresh();
    }

    return (
        <Navbar
            isAuthenticated={status === 'authenticated'}
            userName={session?.user?.name ?? undefined}
            userAvatarUrl={session?.user?.image ?? undefined}
            unreadNotificationCount={unreadCount}
            onSignOut={handleSignOut}
        />
    );
}
