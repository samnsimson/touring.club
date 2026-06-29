import { HttpClient } from '@tc/common';
import { ConfigService } from '@tc/config';
import { NotificationsClient } from '../../src/app/clients/notifications.client';

describe('NotificationsClient', () => {
    let client: NotificationsClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let http: jest.Mocked<Pick<HttpClient, 'post'>>;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://notifications-service:3004') };
        http = { post: jest.fn() };
        client = new NotificationsClient(config as unknown as ConfigService, http as unknown as HttpClient);
    });

    describe('createNotification', () => {
        it('posts a notification to the notifications service', async () => {
            http.post.mockResolvedValue({ data: {} } as Awaited<ReturnType<HttpClient['post']>>);
            const payload = { userId: 'user-b', type: 'trip_approved' as const, title: 'Approved' };
            await client.createNotification(payload);
            expect(config.get).toHaveBeenCalledWith('NOTIFICATIONS_SERVICE_URL');
            expect(http.post).toHaveBeenCalledWith('http://notifications-service:3004/api/v1/notifications/internal', payload);
        });

        it('swallows http errors so the caller is not blocked', async () => {
            http.post.mockRejectedValue(new Error('network failure'));
            await expect(client.createNotification({ userId: 'user-b', type: 'new_message', title: 'New message' })).resolves.toBeUndefined();
        });
    });
});
