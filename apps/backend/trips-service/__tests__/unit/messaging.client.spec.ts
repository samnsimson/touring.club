import { MessagingServiceApi } from '@tc/api-client';
import { ConfigService } from '@tc/config';
import { MessagingClient } from '../../src/app/clients/messaging.client';

jest.mock('@tc/api-client', () => ({
    ...jest.requireActual('@tc/api-client'),
    MessagingServiceApi: jest.fn(),
}));

describe('MessagingClient', () => {
    let client: MessagingClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let postTripSystemEvent: jest.Mock;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://messaging-service:3003') };
        postTripSystemEvent = jest.fn();
        (MessagingServiceApi as unknown as jest.Mock).mockImplementation(() => ({ postTripSystemEvent }));
        client = new MessagingClient(config as unknown as ConfigService);
    });

    describe('postTripSystemEvent', () => {
        it('posts a system event to the messaging service', async () => {
            postTripSystemEvent.mockResolvedValue({ data: {} });
            const payload = { event: 'member_joined' as const, actorUserId: 'user-a', subjectUserId: 'user-b' };
            await client.postTripSystemEvent('trip-1', payload, 'Bearer token');
            expect(MessagingServiceApi).toHaveBeenCalledWith({ baseUrl: 'http://messaging-service:3003' });
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
