import { Map, MessageCircle, Bell, Users } from 'lucide-react';
import { PageHeader, SimpleGrid, StatCard } from '@tc/ui';
import { currentUser, getTripsByOrganizer, mockConversations, mockNotifications } from '@tc/mocks';

export const metadata = {
    title: 'Dashboard — touring.club',
};

export default function DashboardPage() {
    const organizedTrips = getTripsByOrganizer(currentUser.id);
    const unreadMessages = mockConversations.reduce((total, conversation) => total + conversation.unreadCount, 0);
    const unreadNotifications = mockNotifications.filter((notification) => notification.userId === currentUser.id && !notification.read).length;

    return (
        <>
            <PageHeader title={`Welcome back, ${currentUser.name.split(' ')[0]}`} description="Here's what's happening across your trips." />
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6">
                <StatCard label="Trips organized" value={organizedTrips.length} icon={<Map size={20} />} />
                <StatCard label="Trips joined" value={currentUser.tripsJoinedCount} icon={<Users size={20} />} />
                <StatCard label="Unread messages" value={unreadMessages} icon={<MessageCircle size={20} />} />
                <StatCard label="Unread notifications" value={unreadNotifications} icon={<Bell size={20} />} />
            </SimpleGrid>
        </>
    );
}
