import { HttpClient } from '@tc/common';
import { ConfigService } from '@tc/config';
import { MessagingClient } from '../../src/app/clients/messaging.client';

describe('MessagingClient', () => {
    let client: MessagingClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let http: jest.Mocked<Pick<HttpClient, 'post'>>;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://messaging-service:3003') };
        http = { post: jest.fn() };
        client = new MessagingClient(config as ConfigService, http as HttpClient);
    });

    describe('postTripSystemEvent', () => {
        it('posts a system event to the messaging service', async () => {
            http.post.mockResolvedValue({ data: {} } as Awaited<ReturnType<HttpClient['post']>>);
            const payload = { event: 'member_joined' as const, actorUserId: 'user-a', subjectUserId: 'user-b' };
            await client.postTripSystemEvent('trip-1', payload, 'Bearer token');
            expect(config.get).toHaveBeenCalledWith('MESSAGING_SERVICE_URL');
            expect(http.post).toHaveBeenCalledWith('http://messaging-service:3003/api/v1/conversations/internal/trips/trip-1/system-events', payload, {
                headers: { Authorization: 'Bearer token' },
            });
        });

        it('swallows http errors so trip operations are not blocked', async () => {
            http.post.mockRejectedValue(new Error('network failure'));
            await expect(
                client.postTripSystemEvent('trip-1', { event: 'member_left', actorUserId: 'user-a', subjectUserId: 'user-a' }, 'Bearer token'),
            ).resolves.toBeUndefined();
        });
    });
});
