import { ServiceUnavailableException } from '@nestjs/common';
import { TripsServiceApi } from '@tc/server-api';
import { ConfigService } from '@tc/config';
import { TripsClient } from '../../src/app/clients/trips.client';

jest.mock('@tc/server-api', () => ({
    ...jest.requireActual('@tc/server-api'),
    TripsServiceApi: jest.fn(),
}));

describe('TripsClient', () => {
    let client: TripsClient;
    let config: jest.Mocked<Pick<ConfigService, 'get'>>;
    let getUserTravelHistory: jest.Mock;

    beforeEach(() => {
        config = { get: jest.fn().mockReturnValue('http://trips-service:3003') };
        getUserTravelHistory = jest.fn();
        (TripsServiceApi as jest.Mock).mockImplementation(() => ({ getUserTravelHistory }));
        client = new TripsClient(config as ConfigService);
    });

    describe('getTravelHistory', () => {
        it('fetches travel history from the trips service', async () => {
            const payload = { trips: [{ id: 'trip-1', title: 'Coast', destination: 'CA', startDate: '2026-07-01', endDate: '2026-07-07' }] };
            getUserTravelHistory.mockResolvedValue({ data: payload });
            const result = await client.getTravelHistory('user-1', 'Bearer token');
            expect(config.get).toHaveBeenCalledWith('TRIPS_SERVICE_URL');
            expect(TripsServiceApi).toHaveBeenCalledWith({ baseUrl: 'http://trips-service:3003' });
            expect(getUserTravelHistory).toHaveBeenCalledWith({
                path: { userId: 'user-1' },
                headers: { Authorization: 'Bearer token' },
                throwOnError: true,
            });
            expect(result).toBe(payload);
        });

        it('throws ServiceUnavailableException when the trips service call fails', async () => {
            getUserTravelHistory.mockRejectedValue(new Error('network failure'));
            await expect(client.getTravelHistory('user-1', 'Bearer token')).rejects.toBeInstanceOf(ServiceUnavailableException);
        });
    });
});
