import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Notification } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { NotificationRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let notifications: jest.Mocked<Pick<NotificationRepository, 'findByUserId' | 'findByIdAndUserId' | 'save'>>;

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
        };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: NotificationRepository, useValue: notifications }],
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
