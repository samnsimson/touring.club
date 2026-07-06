import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { TripsServiceApi } from '@tc/api-client';
import { TravelHistoryResponseDto } from '@tc/api-client/clients/trips-service';
import { ConfigService } from '@tc/config';

@Injectable()
export class TripsClient {
    private readonly api: TripsServiceApi;

    constructor(private readonly config: ConfigService) {
        this.api = new TripsServiceApi({ baseUrl: `${this.config.get('TRIPS_SERVICE_URL')}/api/v1` });
    }

    async getTravelHistory(userId: string, authorization: string): Promise<TravelHistoryResponseDto> {
        try {
            const { data } = await this.api.getUserTravelHistory({
                path: { userId },
                headers: { Authorization: authorization },
                throwOnError: true,
            });
            return data;
        } catch {
            throw new ServiceUnavailableException('Unable to load travel history');
        }
    }
}
