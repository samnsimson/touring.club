import { ServiceUnavailableException } from '@nestjs/common';
import { ServerApi } from '@tc/server-api';
import { TripsClient } from '../../src/app/clients/trips.client';

describe('TripsClient', () => {
    let client: TripsClient;
    let serverApi: jest.Mocked<Pick<ServerApi, 'tripsService'>>;
    let getUserTravelHistory: jest.Mock;

    beforeEach(() => {
        getUserTravelHistory = jest.fn();
        serverApi = { tripsService: { getUserTravelHistory } as unknown as ServerApi['tripsService'] };
        client = new TripsClient(serverApi as unknown as ServerApi);
    });

    describe('getTravelHistory', () => {
        it('fetches travel history from the trips service', async () => {
            const payload = { trips: [{ id: 'trip-1', title: 'Coast', destination: 'CA', startDate: '2026-07-01', endDate: '2026-07-07' }] };
            getUserTravelHistory.mockResolvedValue({ data: payload });
            const result = await client.getTravelHistory('user-1', 'Bearer token');
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
