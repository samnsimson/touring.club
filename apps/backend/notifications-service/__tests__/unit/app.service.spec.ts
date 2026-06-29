import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Notification } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { NotificationRepository } from '../../src/app/repositories';
import { NotificationsGateway } from '../../src/app/gateways';

jest.mock('@tc/auth', () => ({
    WsAuthGuard: class {},
}));

describe('AppService', () => {
    let service: AppService;
    let notifications: jest.Mocked<Pick<NotificationRepository, 'findByUserId' | 'findByIdAndUserId' | 'save' | 'create'>>;
    let gateway: jest.Mocked<Pick<NotificationsGateway, 'emitNotificationCreated'>>;

    const baseNotification: Notification = {
        id: 'notification-1',
        userId: 'user-a',
        type: 'new_message',
        title: 'New message',
        body: 'Hello there!',
        readAt: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
    };

    beforeAll(async () => {
        notifications = {
            findByUserId: jest.fn(),
            findByIdAndUserId: jest.fn(),
            save: jest.fn(async (notification) => notification),
            create: jest.fn((data) => ({ ...baseNotification, ...data }) as Notification),
        };
        gateway = { emitNotificationCreated: jest.fn() };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: NotificationRepository, useValue: notifications }, { provide: NotificationsGateway, useValue: gateway }],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listNotifications', () => {
        it('returns notifications for the user', async () => {
            notifications.findByUserId.mockResolvedValue([baseNotification]);
            const result = await service.listNotifications('user-a');
            expect(result.notifications).toHaveLength(1);
            expect(result.notifications[0].title).toBe('New message');
        });
    });

    describe('createNotification', () => {
        it('saves the notification and emits it over the gateway', async () => {
            const result = await service.createNotification({ userId: 'user-a', type: 'trip_approved', title: 'Approved', body: 'Welcome' });
            expect(notifications.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-a', type: 'trip_approved', title: 'Approved' }));
            expect(gateway.emitNotificationCreated).toHaveBeenCalledWith('user-a', expect.objectContaining({ title: 'Approved' }));
            expect(result.notification.title).toBe('Approved');
        });
    });

    describe('markNotificationRead', () => {
        it('marks an unread notification as read', async () => {
            notifications.findByIdAndUserId.mockResolvedValue({ ...baseNotification });
            const result = await service.markNotificationRead('user-a', 'notification-1');
            expect(notifications.save).toHaveBeenCalledWith(expect.objectContaining({ readAt: expect.any(Date) }));
            expect(result.notification.readAt).toBeInstanceOf(Date);
        });

        it('returns an already-read notification without saving again', async () => {
            const readAt = new Date('2026-01-03T00:00:00.000Z');
            notifications.findByIdAndUserId.mockResolvedValue({ ...baseNotification, readAt });
            const result = await service.markNotificationRead('user-a', 'notification-1');
            expect(notifications.save).not.toHaveBeenCalled();
            expect(result.notification.readAt).toEqual(readAt);
        });

        it('throws when the notification does not belong to the user', async () => {
            notifications.findByIdAndUserId.mockResolvedValue(null);
            await expect(service.markNotificationRead('user-a', 'notification-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
