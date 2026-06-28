import { Conversation, ConversationParticipant, type DataSource } from '@tc/database';
import { ConversationRepository } from '../../src/app/repositories/conversation.repository';

describe('ConversationRepository', () => {
    it('extends BaseRepository with Conversation entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new ConversationRepository(dataSource)).toBeInstanceOf(ConversationRepository);
    });

    describe('findDirectBetweenUsers', () => {
        let conversationRepository: ConversationRepository;
        let queryBuilder: {
            innerJoin: jest.Mock;
            where: jest.Mock;
            andWhere: jest.Mock;
            getOne: jest.Mock;
        };

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            conversationRepository = new ConversationRepository(dataSource);
            queryBuilder = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            };
            jest.spyOn(conversationRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as never);
        });

        it('queries direct conversations between two users', async () => {
            const conversation = { id: 'conversation-1' } as Conversation;
            queryBuilder.getOne.mockResolvedValue(conversation);
            const result = await conversationRepository.findDirectBetweenUsers('user-a', 'user-b');
            expect(conversationRepository.createQueryBuilder).toHaveBeenCalledWith('conversation');
            expect(queryBuilder.innerJoin).toHaveBeenNthCalledWith(
                1,
                ConversationParticipant,
                'participant_a',
                'participant_a.conversationId = conversation.id',
            );
            expect(queryBuilder.innerJoin).toHaveBeenNthCalledWith(
                2,
                ConversationParticipant,
                'participant_b',
                'participant_b.conversationId = conversation.id',
            );
            expect(queryBuilder.where).toHaveBeenCalledWith('conversation.type = :type', { type: 'direct' });
            expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(1, 'participant_a.userId = :userId', { userId: 'user-a' });
            expect(queryBuilder.andWhere).toHaveBeenNthCalledWith(2, 'participant_b.userId = :otherUserId', { otherUserId: 'user-b' });
            expect(result).toBe(conversation);
        });
    });

    describe('findForUser', () => {
        let conversationRepository: ConversationRepository;
        let queryBuilder: {
            innerJoin: jest.Mock;
            where: jest.Mock;
            orderBy: jest.Mock;
            getMany: jest.Mock;
        };

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            conversationRepository = new ConversationRepository(dataSource);
            queryBuilder = {
                innerJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                getMany: jest.fn().mockResolvedValue([]),
            };
            jest.spyOn(conversationRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as never);
        });

        it('queries conversations for a user ordered by updatedAt descending', async () => {
            const conversations = [{ id: 'conversation-1' }] as Conversation[];
            queryBuilder.getMany.mockResolvedValue(conversations);
            const result = await conversationRepository.findForUser('user-a');
            expect(conversationRepository.createQueryBuilder).toHaveBeenCalledWith('conversation');
            expect(queryBuilder.innerJoin).toHaveBeenCalledWith(ConversationParticipant, 'participant', 'participant.conversationId = conversation.id');
            expect(queryBuilder.where).toHaveBeenCalledWith('participant.userId = :userId', { userId: 'user-a' });
            expect(queryBuilder.orderBy).toHaveBeenCalledWith('conversation.updatedAt', 'DESC');
            expect(result).toBe(conversations);
        });
    });
});
