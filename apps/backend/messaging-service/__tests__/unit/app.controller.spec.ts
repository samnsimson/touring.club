import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

jest.mock('@tc/auth', () => ({
    CurrentSession: () => () => undefined,
    Public: () => () => undefined,
    WsAuthGuard: class {},
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<
        Pick<
            AppService,
            | 'createDirectConversation'
            | 'listConversations'
            | 'getTripConversation'
            | 'listTripMessages'
            | 'sendTripMessage'
            | 'uploadTripMessageAttachment'
            | 'postTripSystemEvent'
            | 'listMessages'
            | 'sendMessage'
            | 'uploadMessageAttachment'
        >
    >;

    beforeAll(async () => {
        appService = {
            createDirectConversation: jest.fn(),
            listConversations: jest.fn(),
            getTripConversation: jest.fn(),
            listTripMessages: jest.fn(),
            sendTripMessage: jest.fn(),
            uploadTripMessageAttachment: jest.fn(),
            postTripSystemEvent: jest.fn(),
            listMessages: jest.fn(),
            sendMessage: jest.fn(),
            uploadMessageAttachment: jest.fn(),
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
        await expect(controller.sendTripMessage(userId, 'trip-1', { body: 'Hello trip' }, 'Bearer token')).resolves.toMatchObject({
            message: { body: 'Hello trip' },
        });
        expect(appService.sendTripMessage).toHaveBeenCalledWith('user-a', 'trip-1', { body: 'Hello trip' }, 'Bearer token');
    });

    it('uploadTripMessageAttachment delegates to AppService', async () => {
        const file = { buffer: Buffer.from('img'), mimetype: 'image/png', originalname: 'photo.png' } as Express.Multer.File;
        appService.uploadTripMessageAttachment.mockResolvedValue({ message: { id: 'message-1', messageType: 'image' } } as never);
        await expect(controller.uploadTripMessageAttachment(userId, 'trip-1', file, 'Bearer token')).resolves.toMatchObject({
            message: { messageType: 'image' },
        });
        expect(appService.uploadTripMessageAttachment).toHaveBeenCalledWith('user-a', 'trip-1', file, 'Bearer token');
    });

    it('postTripSystemEvent delegates to AppService', async () => {
        appService.postTripSystemEvent.mockResolvedValue({ message: { id: 'message-1', messageType: 'system' } } as never);
        const dto = { event: 'member_joined' as const, actorUserId: 'user-a', subjectUserId: 'user-b' };
        await expect(controller.postTripSystemEvent('trip-1', dto)).resolves.toMatchObject({ message: { messageType: 'system' } });
        expect(appService.postTripSystemEvent).toHaveBeenCalledWith('trip-1', dto);
    });

    it('listMessages delegates to AppService', async () => {
        appService.listMessages.mockResolvedValue({ messages: [] });
        await expect(controller.listMessages(userId, 'conversation-1')).resolves.toEqual({ messages: [] });
        expect(appService.listMessages).toHaveBeenCalledWith('user-a', 'conversation-1');
    });

    it('sendMessage delegates to AppService', async () => {
        appService.sendMessage.mockResolvedValue({ message: { id: 'message-1', body: 'Hello' } } as never);
        await expect(controller.sendMessage(userId, 'conversation-1', { body: 'Hello' }, 'Bearer token')).resolves.toMatchObject({
            message: { body: 'Hello' },
        });
        expect(appService.sendMessage).toHaveBeenCalledWith('user-a', 'conversation-1', { body: 'Hello' }, 'Bearer token');
    });

    it('uploadMessageAttachment delegates to AppService', async () => {
        const file = { buffer: Buffer.from('img'), mimetype: 'image/png', originalname: 'photo.png' } as Express.Multer.File;
        appService.uploadMessageAttachment.mockResolvedValue({ message: { id: 'message-1', messageType: 'image' } } as never);
        await expect(controller.uploadMessageAttachment(userId, 'conversation-1', file, 'Bearer token')).resolves.toMatchObject({
            message: { messageType: 'image' },
        });
        expect(appService.uploadMessageAttachment).toHaveBeenCalledWith('user-a', 'conversation-1', file, 'Bearer token');
    });
});
