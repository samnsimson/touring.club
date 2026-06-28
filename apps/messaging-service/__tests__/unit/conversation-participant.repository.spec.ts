import { ConversationParticipant, type DataSource } from '@tc/database';
import { ConversationParticipantRepository } from '../../src/app/repositories/conversation-participant.repository';

describe('ConversationParticipantRepository', () => {
    it('extends BaseRepository with ConversationParticipant entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new ConversationParticipantRepository(dataSource)).toBeInstanceOf(ConversationParticipantRepository);
    });

    describe('findByConversationAndUser', () => {
        let participantRepository: ConversationParticipantRepository;
        let findOne: jest.SpiedFunction<ConversationParticipantRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            participantRepository = new ConversationParticipantRepository(dataSource);
            findOne = jest.spyOn(participantRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries by conversation id and user id', async () => {
            const participant = { id: 'participant-1', conversationId: 'conversation-1', userId: 'user-a' } as ConversationParticipant;
            findOne.mockResolvedValue(participant);
            const result = await participantRepository.findByConversationAndUser('conversation-1', 'user-a');
            expect(findOne).toHaveBeenCalledWith({ where: { conversation: { id: 'conversation-1' }, userId: 'user-a' } });
            expect(result).toBe(participant);
        });
    });
});
