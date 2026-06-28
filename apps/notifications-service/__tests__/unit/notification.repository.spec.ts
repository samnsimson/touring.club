import { Notification, type DataSource } from '@tc/database';
import { NotificationRepository } from '../../src/app/repositories/notification.repository';

describe('NotificationRepository', () => {
    it('extends BaseRepository with Notification entity', () => {
        const dataSource = { manager: {} } as DataSource;
        expect(new NotificationRepository(dataSource)).toBeInstanceOf(NotificationRepository);
    });

    describe('findByUserId', () => {
        let notificationRepository: NotificationRepository;
        let find: jest.SpiedFunction<NotificationRepository['find']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            notificationRepository = new NotificationRepository(dataSource);
            find = jest.spyOn(notificationRepository, 'find').mockResolvedValue([]);
        });

        it('queries by user id ordered by createdAt descending', async () => {
            const notifications = [{ id: 'notification-1' }] as Notification[];
            find.mockResolvedValue(notifications);
            const result = await notificationRepository.findByUserId('user-a');
            expect(find).toHaveBeenCalledWith({ where: { userId: 'user-a' }, order: { createdAt: 'DESC' } });
            expect(result).toBe(notifications);
        });
    });

    describe('findByIdAndUserId', () => {
        let notificationRepository: NotificationRepository;
        let findOne: jest.SpiedFunction<NotificationRepository['findOne']>;

        beforeEach(() => {
            const dataSource = { manager: {} } as DataSource;
            notificationRepository = new NotificationRepository(dataSource);
            findOne = jest.spyOn(notificationRepository, 'findOne').mockResolvedValue(null);
        });

        it('queries by id and user id', async () => {
            const notification = { id: 'notification-1', userId: 'user-a' } as Notification;
            findOne.mockResolvedValue(notification);
            const result = await notificationRepository.findByIdAndUserId('notification-1', 'user-a');
            expect(findOne).toHaveBeenCalledWith({ where: { id: 'notification-1', userId: 'user-a' } });
            expect(result).toBe(notification);
        });
    });
});
