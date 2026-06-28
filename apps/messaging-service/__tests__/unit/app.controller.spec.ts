import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

jest.mock('@tc/auth', () => ({
    CurrentSession: () => () => undefined,
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<
        Pick<
            AppService,
            'createDirectConversation' | 'listConversations' | 'getTripConversation' | 'listTripMessages' | 'sendTripMessage' | 'listMessages' | 'sendMessage'
        >
    >;

    beforeAll(async () => {
        appService = {
            createDirectConversation: jest.fn(),
            listConversations: jest.fn(),
            getTripConversation: jest.fn(),
            listTripMessages: jest.fn(),
            sendTripMessage: jest.fn(),
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

    const userId = 'user-a';
    const conversationResponse = { conversation: { id: 'conversation-1', type: 'direct' } };

    it('createDirectConversation delegates to AppService', async () => {
        appService.createDirectConversation.mockResolvedValue(conversationResponse as never);
        await expect(controller.createDirectConversation(userId, { participantUserId: 'user-b' })).resolves.toEqual(conversationResponse);
        expect(appService.createDirectConversation).toHaveBeenCalledWith('user-a', { participantUserId: 'user-b' });
    });

    it('listConversations delegates to AppService', async () => {
        appService.listConversations.mockResolvedValue({ conversations: [] });
        await expect(controller.listConversations(userId)).resolves.toEqual({ conversations: [] });
        expect(appService.listConversations).toHaveBeenCalledWith('user-a');
    });

    it('getTripConversation delegates to AppService', async () => {
        appService.getTripConversation.mockResolvedValue({ conversation: { id: 'conversation-trip-1', type: 'trip', tripId: 'trip-1' } } as never);
        await expect(controller.getTripConversation(userId, 'trip-1')).resolves.toMatchObject({ conversation: { type: 'trip' } });
        expect(appService.getTripConversation).toHaveBeenCalledWith('user-a', 'trip-1');
    });

    it('listTripMessages delegates to AppService', async () => {
        appService.listTripMessages.mockResolvedValue({ messages: [] });
        await expect(controller.listTripMessages(userId, 'trip-1')).resolves.toEqual({ messages: [] });
        expect(appService.listTripMessages).toHaveBeenCalledWith('user-a', 'trip-1');
    });

    it('sendTripMessage delegates to AppService', async () => {
        appService.sendTripMessage.mockResolvedValue({ message: { id: 'message-1', body: 'Hello trip' } } as never);
        await expect(controller.sendTripMessage(userId, 'trip-1', { body: 'Hello trip' })).resolves.toMatchObject({ message: { body: 'Hello trip' } });
        expect(appService.sendTripMessage).toHaveBeenCalledWith('user-a', 'trip-1', { body: 'Hello trip' });
    });

    it('listMessages delegates to AppService', async () => {
        appService.listMessages.mockResolvedValue({ messages: [] });
        await expect(controller.listMessages(userId, 'conversation-1')).resolves.toEqual({ messages: [] });
        expect(appService.listMessages).toHaveBeenCalledWith('user-a', 'conversation-1');
    });

    it('sendMessage delegates to AppService', async () => {
        appService.sendMessage.mockResolvedValue({ message: { id: 'message-1', body: 'Hello' } } as never);
        await expect(controller.sendMessage(userId, 'conversation-1', { body: 'Hello' })).resolves.toMatchObject({ message: { body: 'Hello' } });
        expect(appService.sendMessage).toHaveBeenCalledWith('user-a', 'conversation-1', { body: 'Hello' });
    });
});
