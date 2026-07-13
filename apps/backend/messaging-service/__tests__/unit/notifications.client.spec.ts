import { ServerApi } from '@tc/server-api';
import { NotificationsClient } from '../../src/app/clients/notifications.client';

describe('NotificationsClient', () => {
    let client: NotificationsClient;
    let serverApi: jest.Mocked<Pick<ServerApi, 'notificationsService'>>;
    let createNotification: jest.Mock;

    beforeEach(() => {
        createNotification = jest.fn();
        serverApi = { notificationsService: { createNotification } as unknown as ServerApi['notificationsService'] };
        client = new NotificationsClient(serverApi as unknown as ServerApi);
    });

    describe('createNotification', () => {
        it('posts a notification to the notifications service', async () => {
            createNotification.mockResolvedValue({ data: {} });
            const payload = { userId: 'user-b', type: 'new_message' as const, title: 'New message' };
            await client.createNotification(payload, 'Bearer token');
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
