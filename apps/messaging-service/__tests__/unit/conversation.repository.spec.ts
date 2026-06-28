import { Conversation, type DataSource } from '@tc/database';
import { ConversationRepository } from '../../src/app/repositories/conversation.repository';

describe('ConversationRepository', () => {
    it('extends BaseRepository with Conversation entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new ConversationRepository(dataSource)).toBeInstanceOf(ConversationRepository);
    });

    describe('findDirectBetweenUsers', () => {
        let conversationRepository: ConversationRepository;
        let findOne: jest.SpiedFunction<ConversationRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            conversationRepository = new ConversationRepository(dataSource);
            findOne = jest.spyOn(conversationRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries direct conversations between two users', async () => {
            const conversation = { id: 'conversation-1' } as Conversation;
            findOne.mockResolvedValue(conversation);
            const result = await conversationRepository.findDirectBetweenUsers('user-a', 'user-b');
            expect(findOne).toHaveBeenCalledWith({
                where: {
                    type: 'direct',
                    participants: [{ userId: 'user-a' }, { userId: 'user-b' }],
                },
            });
            expect(result).toBe(conversation);
        });
    });

    describe('findForUser', () => {
        let conversationRepository: ConversationRepository;
        let find: jest.SpiedFunction<ConversationRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            conversationRepository = new ConversationRepository(dataSource);
            find = jest.spyOn(conversationRepository, 'find').mockResolvedValue([]);
        });

        it('queries conversations for a user ordered by updatedAt descending', async () => {
            const conversations = [{ id: 'conversation-1' }] as Conversation[];
            find.mockResolvedValue(conversations);
            const result = await conversationRepository.findForUser('user-a');
            expect(find).toHaveBeenCalledWith({
                where: { participants: { userId: 'user-a' } },
                order: { updatedAt: 'DESC' },
            });
            expect(result).toBe(conversations);
        });
    });
});
