import { ConversationsGateway } from '../../src/app/gateways';
import { ConversationParticipantRepository } from '../../src/app/repositories';
import { MessageResponse } from '../../src/app/dto';

jest.mock('@tc/auth', () => ({
    WsAuthGuard: class {},
}));

describe('ConversationsGateway', () => {
    let gateway: ConversationsGateway;
    let participants: jest.Mocked<Pick<ConversationParticipantRepository, 'findByUserId'>>;

    beforeEach(() => {
        participants = { findByUserId: jest.fn() };
        gateway = new ConversationsGateway(participants as unknown as ConversationParticipantRepository);
    });

    it('joins a room per conversation the user participates in', async () => {
        participants.findByUserId.mockResolvedValue([
            { id: 'p1', conversationId: 'conversation-1', userId: 'user-a', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
            { id: 'p2', conversationId: 'conversation-2', userId: 'user-a', createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
        ]);
        const client = { data: { userId: 'user-a' }, join: jest.fn() } as never;
        const result = await gateway.handleJoin(client);
        expect(client.join).toHaveBeenCalledWith('conversation:conversation-1');
        expect(client.join).toHaveBeenCalledWith('conversation:conversation-2');
        expect(result).toEqual({ joined: true });
    });

    it('emits message:new to the conversation room', () => {
        const emit = jest.fn();
        const to = jest.fn(() => ({ emit }));
        Object.defineProperty(gateway, 'server', { value: { to }, writable: true });
        const message = { id: 'message-1', body: 'Hello' } as MessageResponse;
        gateway.emitNewMessage('conversation-1', message);
        expect(to).toHaveBeenCalledWith('conversation:conversation-1');
        expect(emit).toHaveBeenCalledWith('message:new', message);
    });
});
