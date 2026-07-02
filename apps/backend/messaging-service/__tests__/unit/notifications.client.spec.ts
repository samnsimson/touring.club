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
        client = new NotificationsClient(config as ConfigService, http as HttpClient);
    });

    describe('createNotification', () => {
        it('posts a notification to the notifications service', async () => {
            http.post.mockResolvedValue({ data: {} } as Awaited<ReturnType<HttpClient['post']>>);
            const payload = { userId: 'user-b', type: 'new_message' as const, title: 'New message' };
            await client.createNotification(payload, 'Bearer token');
            expect(config.get).toHaveBeenCalledWith('NOTIFICATIONS_SERVICE_URL');
            expect(http.post).toHaveBeenCalledWith('http://notifications-service:3004/api/v1/notifications/internal', payload, {
                headers: { Authorization: 'Bearer token' },
            });
        });

        it('swallows http errors so the caller is not blocked', async () => {
            http.post.mockRejectedValue(new Error('network failure'));
            await expect(client.createNotification({ userId: 'user-b', type: 'new_message', title: 'New message' }, 'Bearer token')).resolves.toBeUndefined();
        });
    });
});
