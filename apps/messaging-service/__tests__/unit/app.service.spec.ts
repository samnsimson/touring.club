import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Conversation, Message } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { ConversationParticipantRepository, ConversationRepository, MessageRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let conversations: jest.Mocked<Pick<ConversationRepository, 'create' | 'save' | 'findDirectBetweenUsers' | 'findForUser' | 'update'>>;
    let participants: jest.Mocked<Pick<ConversationParticipantRepository, 'create' | 'save' | 'findByConversationAndUser'>>;
    let messages: jest.Mocked<Pick<MessageRepository, 'create' | 'save' | 'findByConversationId'>>;

    const baseConversation: Conversation = {
        id: 'conversation-1',
        type: 'direct',
        tripId: null,
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
            save: jest.fn(async (conversation) => ({ ...baseConversation, ...conversation, id: 'conversation-1' })),
            findDirectBetweenUsers: jest.fn(),
            findForUser: jest.fn(),
            update: jest.fn(async () => ({ affected: 1, raw: [], generatedMaps: [] })),
        };
        participants = {
            create: jest.fn((data) => data),
            save: jest.fn(async (rows) => rows),
            findByConversationAndUser: jest.fn(),
        };
        messages = {
            create: jest.fn((data) => data as Message),
            save: jest.fn(async (message) => ({ ...baseMessage, ...message, id: 'message-1' })),
            findByConversationId: jest.fn(),
        };

        const app = await Test.createTestingModule({
            providers: [
                AppService,
                { provide: ConversationRepository, useValue: conversations },
                { provide: ConversationParticipantRepository, useValue: participants },
                { provide: MessageRepository, useValue: messages },
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

    describe('sendMessage', () => {
        it('stores a text message for a participant', async () => {
            const result = await service.sendMessage('user-a', 'conversation-1', { body: 'Hello there!' });
            expect(messages.save).toHaveBeenCalledWith(expect.objectContaining({ body: 'Hello there!', senderId: 'user-a' }));
            expect(result.message.body).toBe('Hello there!');
        });

        it('throws when the user is not a participant', async () => {
            participants.findByConversationAndUser.mockResolvedValue(null);
            await expect(service.sendMessage('user-a', 'conversation-1', { body: 'Hello there!' })).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
