import { Test } from '@nestjs/testing';
import { AppController } from '../../src/app/app.controller';
import { AppService } from '../../src/app/app.service';

jest.mock('@tc/auth', () => ({
    CurrentSession: () => () => undefined,
}));

describe('AppController', () => {
    let controller: AppController;
    let appService: jest.Mocked<Pick<AppService, 'listNotifications' | 'markNotificationRead'>>;

    beforeAll(async () => {
        appService = {
            listNotifications: jest.fn(),
            markNotificationRead: jest.fn(),
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
});
