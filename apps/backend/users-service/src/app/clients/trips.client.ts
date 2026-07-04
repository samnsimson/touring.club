import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ApiClient, TripsClient as TripsSdk } from '@tc/api-client';
import { ConfigService } from '@tc/config';

@Injectable()
export class TripsClient {
    private readonly api: ApiClient;

    constructor(private readonly config: ConfigService) {
        this.api = new ApiClient({ baseUrl: `${this.config.get('TRIPS_SERVICE_URL')}/api/v1` });
    }

    async getTravelHistory(userId: string, authorization: string): Promise<TripsSdk.TravelHistoryResponseDto> {
        try {
            const { data } = await this.api.tripsClient.getUserTravelHistory({
                path: { userId },
                headers: { Authorization: authorization },
            });
            return data;
        } catch {
            throw new ServiceUnavailableException('Unable to load travel history');
        }
    }
}
