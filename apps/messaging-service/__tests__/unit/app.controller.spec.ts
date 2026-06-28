import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'createDirectConversation' | 'listConversations' | 'listMessages' | 'sendMessage'>>;

    beforeAll(async () => {
        appService = {
            createDirectConversation: jest.fn(),
            listConversations: jest.fn(),
            listMessages: jest.fn(),
            sendMessage: jest.fn(),
        };

        const app = await Test.createTestingModule({
            controllers: [AppController],
            providers: [{ provide: AppService, useValue: appService }],
        }).compile();

        controller = app.get<AppController>(AppController);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const req = { session: { userId: 'user-a', sub: 'user-a' } } as never;
    const conversationResponse = { conversation: { id: 'conversation-1', type: 'direct' } };

    it('createDirectConversation delegates to AppService', async () => {
        appService.createDirectConversation.mockResolvedValue(conversationResponse as never);
        await expect(controller.createDirectConversation(req, { participantUserId: 'user-b' })).resolves.toEqual(conversationResponse);
        expect(appService.createDirectConversation).toHaveBeenCalledWith('user-a', { participantUserId: 'user-b' });
    });

    it('listConversations delegates to AppService', async () => {
        appService.listConversations.mockResolvedValue({ conversations: [] });
        await expect(controller.listConversations(req)).resolves.toEqual({ conversations: [] });
        expect(appService.listConversations).toHaveBeenCalledWith('user-a');
    });

    it('sendMessage delegates to AppService', async () => {
        appService.sendMessage.mockResolvedValue({ message: { id: 'message-1', body: 'Hello' } } as never);
        await expect(controller.sendMessage(req, 'conversation-1', { body: 'Hello' })).resolves.toMatchObject({ message: { body: 'Hello' } });
        expect(appService.sendMessage).toHaveBeenCalledWith('user-a', 'conversation-1', { body: 'Hello' });
    });
});
