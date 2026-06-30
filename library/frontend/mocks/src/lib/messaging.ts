import type { Conversation, Message } from './types';

export const mockConversations: Conversation[] = [
    {
        id: 'conv-1',
        type: 'trip',
        tripId: 'trip-1',
        title: 'Torres del Paine Backcountry Trek',
        avatarUrl: 'https://picsum.photos/seed/patagonia-trek/120/120',
        participantIds: ['user-1', 'user-2', 'user-3', 'user-4'],
        unreadCount: 2,
    },
    {
        id: 'conv-2',
        type: 'direct',
        title: 'Kenji Tanaka',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        participantIds: ['user-1', 'user-2'],
        unreadCount: 0,
    },
    {
        id: 'conv-3',
        type: 'trip',
        tripId: 'trip-8',
        title: 'Colorado Rockies Summit Hike',
        avatarUrl: 'https://picsum.photos/seed/rockies-summit/120/120',
        participantIds: ['user-1', 'user-4', 'user-6'],
        unreadCount: 0,
    },
    {
        id: 'conv-4',
        type: 'direct',
        title: 'Leila Haddad',
        avatarUrl: 'https://i.pravatar.cc/150?img=32',
        participantIds: ['user-1', 'user-3'],
        unreadCount: 1,
    },
];

export const mockMessages: Message[] = [
    {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-3',
        type: 'system',
        body: 'Leila Haddad created the trip group chat.',
        createdAt: '2026-06-20T09:00:00Z',
    },
    {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-3',
        type: 'text',
        body: "Hey everyone! Excited to have you all on the W Circuit trek. I'll share the gear list this week.",
        createdAt: '2026-06-20T09:02:00Z',
    },
    {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'user-2',
        type: 'text',
        body: 'Counting down the days. Should we coordinate on camera gear so we are not all carrying the same lenses?',
        createdAt: '2026-06-20T10:14:00Z',
    },
    {
        id: 'msg-4',
        conversationId: 'conv-1',
        senderId: 'user-4',
        type: 'text',
        body: 'Good call. I have a wide-angle and a 70-200, happy to bring both if useful.',
        createdAt: '2026-06-20T10:20:00Z',
    },
    {
        id: 'msg-5',
        conversationId: 'conv-1',
        senderId: 'user-1',
        type: 'text',
        body: 'Sounds great. Also checking — is everyone set on flights into Punta Arenas by the 11th?',
        createdAt: '2026-06-21T08:05:00Z',
    },
    {
        id: 'msg-6',
        conversationId: 'conv-2',
        senderId: 'user-2',
        type: 'text',
        body: 'The Nishiki Market crawl spots filled up fast — glad you grabbed one!',
        createdAt: '2026-06-18T13:40:00Z',
    },
    {
        id: 'msg-7',
        conversationId: 'conv-2',
        senderId: 'user-1',
        type: 'text',
        body: "Can't wait. Any restaurant you think is unmissable?",
        createdAt: '2026-06-18T13:55:00Z',
    },
    {
        id: 'msg-8',
        conversationId: 'conv-3',
        senderId: 'user-6',
        type: 'text',
        body: 'Trailhead parking fills by 6am on weekends, heads up.',
        createdAt: '2026-06-15T07:30:00Z',
    },
    {
        id: 'msg-9',
        conversationId: 'conv-4',
        senderId: 'user-3',
        type: 'text',
        body: 'Sent you the Sahara trek itinerary draft, let me know what you think!',
        createdAt: '2026-06-22T16:00:00Z',
    },
];

export function getMessagesForConversation(conversationId: string): Message[] {
    return mockMessages.filter((message) => message.conversationId === conversationId);
}
