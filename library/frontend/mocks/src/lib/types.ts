export type TripCategory = 'Hiking' | 'Road Trip' | 'National Parks' | 'Photography' | 'Food Tour' | 'Adventure Travel';

export type TripVisibility = 'public' | 'private';

export type TripStatus = 'draft' | 'published' | 'cancelled' | 'archived';

export type TripDifficulty = 'easy' | 'moderate' | 'challenging';

export interface User {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
    bio: string;
    location: string;
    interests: TripCategory[];
    joinedAt: string;
    tripsOrganizedCount: number;
    tripsJoinedCount: number;
}

export interface Trip {
    id: string;
    slug: string;
    title: string;
    description: string;
    destination: string;
    meetingLocation: string;
    startDate: string;
    endDate: string;
    capacity: number;
    joinedCount: number;
    visibility: TripVisibility;
    status: TripStatus;
    difficulty: TripDifficulty;
    coverImageUrl: string;
    categories: TripCategory[];
    tags: string[];
    organizerId: string;
    priceLabel: string;
}

export type MembershipStatus = 'pending' | 'approved' | 'rejected';

export interface TripMembership {
    id: string;
    tripId: string;
    userId: string;
    status: MembershipStatus;
    joinedAt: string;
}

export type ConversationType = 'direct' | 'trip';

export interface Conversation {
    id: string;
    type: ConversationType;
    tripId?: string;
    title: string;
    avatarUrl: string;
    participantIds: string[];
    unreadCount: number;
}

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    type: MessageType;
    body: string;
    createdAt: string;
}

export type NotificationType = 'join_request' | 'trip_approved' | 'new_message' | 'trip_update' | 'announcement';

export interface AppNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
    link: string;
}

export interface Destination {
    id: string;
    name: string;
    country: string;
    imageUrl: string;
    tripCount: number;
    description: string;
}
