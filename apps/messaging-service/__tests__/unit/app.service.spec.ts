import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Conversation, Message, Trip, TripMembership } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import {
    ConversationParticipantRepository,
    ConversationRepository,
    MessageRepository,
    TripMembershipRepository,
    TripRepository,
} from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let conversations: jest.Mocked<Pick<ConversationRepository, 'create' | 'save' | 'findDirectBetweenUsers' | 'findForUser' | 'findByTripId' | 'update'>>;
    let participants: jest.Mocked<Pick<ConversationParticipantRepository, 'create' | 'save' | 'findByConversationAndUser' | 'findByConversationId' | 'remove'>>;
    let messages: jest.Mocked<Pick<MessageRepository, 'create' | 'save' | 'findByConversationId'>>;
    let trips: jest.Mocked<Pick<TripRepository, 'findById'>>;
    let memberships: jest.Mocked<Pick<TripMembershipRepository, 'findByTripAndUser' | 'findActiveByTripId'>>;

    const baseConversation: Conversation = {
        id: 'conversation-1',
        type: 'direct',
        tripId: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
    };

    const tripConversation: Conversation = {
        ...baseConversation,
        id: 'conversation-trip-1',
        type: 'trip',
        tripId: 'trip-1',
    };

    const baseTrip: Trip = {
        id: 'trip-1',
        organizerId: 'organizer-1',
        title: 'Pacific Coast Highway',
        description: null,
        destination: 'California, USA',
        meetingLocation: null,
        startDate: new Date('2026-07-01T09:00:00.000Z'),
        endDate: new Date('2026-07-07T18:00:00.000Z'),
        capacity: 12,
        visibility: 'public',
        status: 'published',
        coverImageUrls: [],
        categories: [],
        tags: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
    };

    const baseMessage: Message = {
        id: 'message-1',
        conversationId: 'conversation-1',
        senderId: 'user-a',
        messageType: 'text',
        body: 'Hello there!',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
    };

    beforeAll(async () => {
        conversations = {
            create: jest.fn((data) => data as Conversation),
            save: jest.fn(async (conversation) => ({ ...baseConversation, ...conversation, id: conversation.id ?? 'conversation-1' })),
            findDirectBetweenUsers: jest.fn(),
            findForUser: jest.fn(),
            findByTripId: jest.fn(),
            update: jest.fn(async () => ({ affected: 1, raw: [], generatedMaps: [] })),
        };
        participants = {
            create: jest.fn((data) => data),
            save: jest.fn(async (rows) => rows),
            findByConversationAndUser: jest.fn(),
            findByConversationId: jest.fn(),
            remove: jest.fn(async () => []),
        };
        messages = {
            create: jest.fn((data) => data as Message),
            save: jest.fn(async (message) => ({ ...baseMessage, ...message, id: 'message-1' })),
            findByConversationId: jest.fn(),
        };
        trips = { findById: jest.fn() };
        memberships = { findByTripAndUser: jest.fn(), findActiveByTripId: jest.fn() };

        const app = await Test.createTestingModule({
            providers: [
                AppService,
                { provide: ConversationRepository, useValue: conversations },
                { provide: ConversationParticipantRepository, useValue: participants },
                { provide: MessageRepository, useValue: messages },
                { provide: TripRepository, useValue: trips },
                { provide: TripMembershipRepository, useValue: memberships },
            ],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        participants.findByConversationAndUser.mockResolvedValue({
            id: 'participant-1',
            conversationId: 'conversation-1',
            userId: 'user-a',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        });
        trips.findById.mockResolvedValue(baseTrip);
        conversations.findByTripId.mockResolvedValue(null);
        conversations.save.mockImplementation(async (conversation) => ({
            ...tripConversation,
            ...conversation,
            id: 'conversation-trip-1',
        }));
        memberships.findActiveByTripId.mockResolvedValue([]);
        participants.findByConversationId.mockResolvedValue([]);
    });

    describe('createDirectConversation', () => {
        it('creates a new direct conversation between two users', async () => {
            conversations.findDirectBetweenUsers.mockResolvedValue(null);
            const result = await service.createDirectConversation('user-a', { participantUserId: 'user-b' });
            expect(conversations.save).toHaveBeenCalled();
            expect(participants.save).toHaveBeenCalled();
            expect(result.conversation.type).toBe('direct');
        });

        it('returns an existing direct conversation', async () => {
            conversations.findDirectBetweenUsers.mockResolvedValue({ ...baseConversation });
            const result = await service.createDirectConversation('user-a', { participantUserId: 'user-b' });
            expect(conversations.save).not.toHaveBeenCalled();
            expect(result.conversation.id).toBe('conversation-1');
        });

        it('rejects creating a conversation with yourself', async () => {
            await expect(service.createDirectConversation('user-a', { participantUserId: 'user-a' })).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('listConversations', () => {
        it('returns conversations for the user', async () => {
            conversations.findForUser.mockResolvedValue([baseConversation]);
            const result = await service.listConversations('user-a');
            expect(conversations.findForUser).toHaveBeenCalledWith('user-a');
            expect(result.conversations).toHaveLength(1);
            expect(result.conversations[0].id).toBe('conversation-1');
        });
    });

    describe('getTripConversation', () => {
        it('creates a trip conversation for the organizer and syncs participants', async () => {
            const result = await service.getTripConversation('organizer-1', 'trip-1');
            expect(conversations.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'trip', trip: { id: 'trip-1' } }));
            expect(participants.save).toHaveBeenCalledWith([expect.objectContaining({ userId: 'organizer-1' })]);
            expect(result.conversation.type).toBe('trip');
            expect(result.conversation.tripId).toBe('trip-1');
        });

        it('returns an existing trip conversation for an active member', async () => {
            conversations.findByTripId.mockResolvedValue(tripConversation);
            memberships.findByTripAndUser.mockResolvedValue({ id: 'membership-1', tripId: 'trip-1', userId: 'member-1', status: 'active' } as TripMembership);
            const result = await service.getTripConversation('member-1', 'trip-1');
            expect(conversations.save).not.toHaveBeenCalled();
            expect(result.conversation.id).toBe('conversation-trip-1');
        });

        it('syncs trip participants when members join or leave', async () => {
            conversations.findByTripId.mockResolvedValue(tripConversation);
            memberships.findActiveByTripId.mockResolvedValue([
                { id: 'membership-1', tripId: 'trip-1', userId: 'member-1', status: 'active' } as TripMembership,
                { id: 'membership-2', tripId: 'trip-1', userId: 'member-2', status: 'active' } as TripMembership,
            ]);
            participants.findByConversationId.mockResolvedValue([
                {
                    id: 'participant-1',
                    conversationId: 'conversation-trip-1',
                    userId: 'organizer-1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
                {
                    id: 'participant-2',
                    conversationId: 'conversation-trip-1',
                    userId: 'former-member',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ]);
            await service.getTripConversation('organizer-1', 'trip-1');
            expect(participants.save).toHaveBeenCalledWith([expect.objectContaining({ userId: 'member-1' }), expect.objectContaining({ userId: 'member-2' })]);
            expect(participants.remove).toHaveBeenCalledWith([expect.objectContaining({ userId: 'former-member' })]);
        });

        it('throws when the trip does not exist', async () => {
            trips.findById.mockResolvedValue(null);
            await expect(service.getTripConversation('organizer-1', 'trip-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws when the user is not an organizer or active member', async () => {
            memberships.findByTripAndUser.mockResolvedValue({ id: 'membership-1', tripId: 'trip-1', userId: 'outsider', status: 'pending' } as TripMembership);
            await expect(service.getTripConversation('outsider', 'trip-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('listTripMessages', () => {
        it('returns messages for an active member', async () => {
            conversations.findByTripId.mockResolvedValue(tripConversation);
            memberships.findByTripAndUser.mockResolvedValue({ id: 'membership-1', tripId: 'trip-1', userId: 'member-1', status: 'active' } as TripMembership);
            messages.findByConversationId.mockResolvedValue([baseMessage]);
            const result = await service.listTripMessages('member-1', 'trip-1');
            expect(messages.findByConversationId).toHaveBeenCalledWith('conversation-trip-1');
            expect(result.messages).toHaveLength(1);
        });
    });

    describe('sendTripMessage', () => {
        it('stores a text message in the trip conversation', async () => {
            conversations.findByTripId.mockResolvedValue(tripConversation);
            participants.findByConversationAndUser.mockResolvedValue({
                id: 'participant-1',
                conversationId: 'conversation-trip-1',
                userId: 'organizer-1',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });
            const result = await service.sendTripMessage('organizer-1', 'trip-1', { body: 'Welcome to the trip!' });
            expect(messages.save).toHaveBeenCalledWith(expect.objectContaining({ body: 'Welcome to the trip!', senderId: 'organizer-1' }));
            expect(result.message.body).toBe('Welcome to the trip!');
        });
    });

    describe('listMessages', () => {
        it('returns messages for a participant', async () => {
            messages.findByConversationId.mockResolvedValue([baseMessage]);
            const result = await service.listMessages('user-a', 'conversation-1');
            expect(messages.findByConversationId).toHaveBeenCalledWith('conversation-1');
            expect(result.messages).toHaveLength(1);
            expect(result.messages[0].body).toBe('Hello there!');
        });

        it('throws when the user is not a participant', async () => {
            participants.findByConversationAndUser.mockResolvedValue(null);
            await expect(service.listMessages('user-a', 'conversation-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('sendMessage', () => {
        it('stores a text message for a participant', async () => {
            const result = await service.sendMessage('user-a', 'conversation-1', { body: 'Hello there!' });
            expect(messages.save).toHaveBeenCalledWith(expect.objectContaining({ body: 'Hello there!', senderId: 'user-a' }));
            expect(conversations.update).toHaveBeenCalledWith({ id: 'conversation-1' }, { updatedAt: expect.any(Date) });
            expect(result.message.body).toBe('Hello there!');
        });

        it('throws when the user is not a participant', async () => {
            participants.findByConversationAndUser.mockResolvedValue(null);
            await expect(service.sendMessage('user-a', 'conversation-1', { body: 'Hello there!' })).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('postTripSystemEvent', () => {
        it('stores a system message in the trip conversation and syncs participants', async () => {
            const result = await service.postTripSystemEvent('trip-1', {
                event: 'member_joined',
                actorUserId: 'participant-1',
                subjectUserId: 'participant-1',
            });
            expect(conversations.save).toHaveBeenCalledWith(expect.objectContaining({ type: 'trip', trip: { id: 'trip-1' } }));
            expect(messages.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    messageType: 'system',
                    senderId: 'participant-1',
                    body: JSON.stringify({ event: 'member_joined', userId: 'participant-1' }),
                }),
            );
            expect(result.message.messageType).toBe('system');
        });

        it('throws when the trip does not exist', async () => {
            trips.findById.mockResolvedValue(null);
            await expect(
                service.postTripSystemEvent('trip-1', { event: 'member_left', actorUserId: 'participant-1', subjectUserId: 'participant-1' }),
            ).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
