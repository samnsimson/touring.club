import { NotificationsServiceApi } from '@tc/server-api';
import { ConfigService } from '@tc/config';
import { NotificationsClient } from '../../src/app/clients/notifications.client';

jest.mock('@tc/server-api', () => ({
    ...jest.requireActual('@tc/server-api'),
    NotificationsServiceApi: jest.fn(),
}));

describe('NotificationsClient', () => {
    let client: NotificationsClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let createNotification: jest.Mock;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://notifications-service:3004') };
        createNotification = jest.fn();
        (NotificationsServiceApi as jest.Mock).mockImplementation(() => ({ createNotification }));
        client = new NotificationsClient(config as unknown as ConfigService);
    });

    describe('createNotification', () => {
        it('posts a notification to the notifications service', async () => {
            createNotification.mockResolvedValue({ data: {} });
            const payload = { userId: 'user-b', type: 'trip_approved' as const, title: 'Approved' };
            await client.createNotification(payload, 'Bearer token');
            expect(NotificationsServiceApi).toHaveBeenCalledWith({ baseUrl: 'http://notifications-service:3004' });
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
