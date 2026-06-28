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

    describe('findByConversationId', () => {
        let participantRepository: ConversationParticipantRepository;
        let find: jest.SpiedFunction<ConversationParticipantRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            participantRepository = new ConversationParticipantRepository(dataSource);
            find = jest.spyOn(participantRepository, 'find').mockResolvedValue([]);
        });

        it('queries participants by conversation id', async () => {
            const participants = [{ id: 'participant-1', conversationId: 'conversation-1', userId: 'user-a' }] as ConversationParticipant[];
            find.mockResolvedValue(participants);
            const result = await participantRepository.findByConversationId('conversation-1');
            expect(find).toHaveBeenCalledWith({ where: { conversation: { id: 'conversation-1' } } });
            expect(result).toBe(participants);
        });
    });

    describe('findByUserId', () => {
        let participantRepository: ConversationParticipantRepository;
        let find: jest.SpiedFunction<ConversationParticipantRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            participantRepository = new ConversationParticipantRepository(dataSource);
            find = jest.spyOn(participantRepository, 'find').mockResolvedValue([]);
        });

        it('queries participants by user id', async () => {
            const participants = [{ id: 'participant-1', conversationId: 'conversation-1', userId: 'user-a' }] as ConversationParticipant[];
            find.mockResolvedValue(participants);
            const result = await participantRepository.findByUserId('user-a');
            expect(find).toHaveBeenCalledWith({ where: { userId: 'user-a' } });
            expect(result).toBe(participants);
        });
    });
});
