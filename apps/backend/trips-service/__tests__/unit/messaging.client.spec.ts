import { ServerApi } from '@tc/server-api';
import { MessagingClient } from '../../src/app/clients/messaging.client';

describe('MessagingClient', () => {
    let client: MessagingClient;
    let serverApi: jest.Mocked<Pick<ServerApi, 'messagingService'>>;
    let postTripSystemEvent: jest.Mock;

    beforeEach(() => {
        postTripSystemEvent = jest.fn();
        serverApi = { messagingService: { postTripSystemEvent } as unknown as ServerApi['messagingService'] };
        client = new MessagingClient(serverApi as unknown as ServerApi);
    });

    describe('postTripSystemEvent', () => {
        it('posts a system event to the messaging service', async () => {
            postTripSystemEvent.mockResolvedValue({ data: {} });
            const payload = { event: 'member_joined' as const, actorUserId: 'user-a', subjectUserId: 'user-b' };
            await client.postTripSystemEvent('trip-1', payload, 'Bearer token');
            expect(postTripSystemEvent).toHaveBeenCalledWith({
                path: { tripId: 'trip-1' },
                body: payload,
                headers: { Authorization: 'Bearer token' },
            });
        });

        it('swallows errors so trip operations are not blocked', async () => {
            postTripSystemEvent.mockRejectedValue(new Error('network failure'));
            await expect(
                client.postTripSystemEvent('trip-1', { event: 'member_left', actorUserId: 'user-a', subjectUserId: 'user-a' }, 'Bearer token'),
            ).resolves.toBeUndefined();
        });
    });
});
