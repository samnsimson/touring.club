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
    let appService: jest.Mocked<Pick<AppService, 'listNotifications' | 'markNotificationRead' | 'createNotification'>>;

    beforeAll(async () => {
        appService = {
            listNotifications: jest.fn(),
            markNotificationRead: jest.fn(),
            createNotification: jest.fn(),
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
    const notification = { id: 'notification-1', type: 'new_message', title: 'New message', body: 'Hello', readAt: null };

    it('listNotifications delegates to AppService', async () => {
        appService.listNotifications.mockResolvedValue({ notifications: [notification] } as never);
        await expect(controller.listNotifications(userId)).resolves.toEqual({ notifications: [notification] });
        expect(appService.listNotifications).toHaveBeenCalledWith('user-a');
    });

    it('markNotificationRead delegates to AppService', async () => {
        appService.markNotificationRead.mockResolvedValue({ notification: { ...notification, readAt: new Date() } } as never);
        await expect(controller.markNotificationRead(userId, 'notification-1')).resolves.toMatchObject({ notification: { id: 'notification-1' } });
        expect(appService.markNotificationRead).toHaveBeenCalledWith('user-a', 'notification-1');
    });

    it('createNotification delegates to AppService', async () => {
        const dto = { userId: 'user-b', type: 'trip_approved' as const, title: 'Approved' };
        appService.createNotification.mockResolvedValue({ notification } as never);
        await expect(controller.createNotification(dto)).resolves.toEqual({ notification });
        expect(appService.createNotification).toHaveBeenCalledWith(dto);
    });
});
