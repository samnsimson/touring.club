import { ApiClient } from '@tc/api-client';
import { ConfigService } from '@tc/config';
import { NotificationsClient } from '../../src/app/clients/notifications.client';

jest.mock('@tc/api-client');

describe('NotificationsClient', () => {
    let client: NotificationsClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let createNotification: jest.Mock;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://notifications-service:3004') };
        createNotification = jest.fn();
        (ApiClient as jest.Mock).mockImplementation(() => ({ notificationsClient: { createNotification } }));
        client = new NotificationsClient(config as ConfigService);
    });

    describe('createNotification', () => {
        it('posts a notification to the notifications service', async () => {
            createNotification.mockResolvedValue({ data: {} });
            const payload = { userId: 'user-b', type: 'new_message' as const, title: 'New message' };
            await client.createNotification(payload, 'Bearer token');
            expect(ApiClient).toHaveBeenCalledWith({ baseUrl: 'http://notifications-service:3004/api/v1' });
            expect(createNotification).toHaveBeenCalledWith({
                body: payload,
                headers: { Authorization: 'Bearer token' },
            });
        });

        it('swallows errors so the caller is not blocked', async () => {
            createNotification.mockRejectedValue(new Error('network failure'));
            await expect(client.createNotification({ userId: 'user-b', type: 'new_message', title: 'New message' }, 'Bearer token')).resolves.toBeUndefined();
        });
    });
});
