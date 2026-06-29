import { Message, type DataSource } from '@tc/database';
import { MessageRepository } from '../../src/app/repositories/message.repository';

describe('MessageRepository', () => {
    it('extends BaseRepository with Message entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new MessageRepository(dataSource)).toBeInstanceOf(MessageRepository);
    });

    describe('findByConversationId', () => {
        let messageRepository: MessageRepository;
        let find: jest.SpiedFunction<MessageRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            messageRepository = new MessageRepository(dataSource);
            find = jest.spyOn(messageRepository, 'find').mockResolvedValue([]);
        });

        it('queries by conversation id ordered by createdAt ascending', async () => {
            const messages = [{ id: 'message-1' }] as Message[];
            find.mockResolvedValue(messages);
            const result = await messageRepository.findByConversationId('conversation-1');
            expect(find).toHaveBeenCalledWith({ where: { conversation: { id: 'conversation-1' } }, order: { createdAt: 'ASC' } });
            expect(result).toBe(messages);
        });
    });
});
