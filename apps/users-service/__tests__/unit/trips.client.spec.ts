import { ServiceUnavailableException } from '@nestjs/common';
import { HttpClient } from '@tc/common';
import { ConfigService } from '@tc/config';
import { TripsClient } from '../../src/app/clients/trips.client';

describe('TripsClient', () => {
    let client: TripsClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let http: jest.Mocked<Pick<HttpClient, 'get'>>;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://trips-service:3003') };
        http = { get: jest.fn() };
        client = new TripsClient(config as ConfigService, http as HttpClient);
    });

    describe('getTravelHistory', () => {
        it('fetches travel history from the trips service', async () => {
            const payload = { trips: [{ id: 'trip-1', title: 'Coast', destination: 'CA', startDate: '2026-07-01', endDate: '2026-07-07' }] };
            http.get.mockResolvedValue({ data: payload } as Awaited<ReturnType<HttpClient['get']>>);
            const result = await client.getTravelHistory('user-1', 'Bearer token');
            expect(config.get).toHaveBeenCalledWith('TRIPS_SERVICE_URL');
            expect(http.get).toHaveBeenCalledWith('http://trips-service:3003/api/v1/trips/users/user-1/travel-history', {
                headers: { Authorization: 'Bearer token' },
            });
            expect(result).toBe(payload);
        });

        it('throws ServiceUnavailableException when the trips service responds with an error', async () => {
            http.get.mockRejectedValue({ isAxiosError: true, response: { status: 503, data: {} } });
            await expect(client.getTravelHistory('user-1', 'Bearer token')).rejects.toBeInstanceOf(ServiceUnavailableException);
        });

        it('rethrows non-http errors', async () => {
            const error = new Error('network failure');
            http.get.mockRejectedValue(error);
            await expect(client.getTravelHistory('user-1', 'Bearer token')).rejects.toBe(error);
        });
    });
});
