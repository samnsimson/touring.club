import { ServiceUnavailableException } from '@nestjs/common';
import { ApiClient } from '@tc/api-client';
import { ConfigService } from '@tc/config';
import { TripsClient } from '../../src/app/clients/trips.client';

jest.mock('@tc/api-client');

describe('TripsClient', () => {
    let client: TripsClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let getUserTravelHistory: jest.Mock;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://trips-service:3003') };
        getUserTravelHistory = jest.fn();
        (ApiClient as jest.Mock).mockImplementation(() => ({ tripsClient: { getUserTravelHistory } }));
        client = new TripsClient(config as ConfigService);
    });

    describe('getTravelHistory', () => {
        it('fetches travel history from the trips service', async () => {
            const payload = { trips: [{ id: 'trip-1', title: 'Coast', destination: 'CA', startDate: '2026-07-01', endDate: '2026-07-07' }] };
            getUserTravelHistory.mockResolvedValue({ data: payload });
            const result = await client.getTravelHistory('user-1', 'Bearer token');
            expect(ApiClient).toHaveBeenCalledWith({ baseUrl: 'http://trips-service:3003/api/v1' });
            expect(getUserTravelHistory).toHaveBeenCalledWith({
                path: { userId: 'user-1' },
                headers: { Authorization: 'Bearer token' },
            });
            expect(result).toBe(payload);
        });

        it('throws ServiceUnavailableException when the trips service call fails', async () => {
            getUserTravelHistory.mockRejectedValue(new Error('network failure'));
            await expect(client.getTravelHistory('user-1', 'Bearer token')).rejects.toBeInstanceOf(ServiceUnavailableException);
        });
    });
});
