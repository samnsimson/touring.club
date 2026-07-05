import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ApiClientUtils, createTripsClient, TripsApi } from '@tc/api-client';
import { ConfigService } from '@tc/config';

@Injectable()
export class TripsClient {
    private readonly api: TripsApi.TripsServiceApi;

    constructor(private readonly config: ConfigService) {
        const baseUrl = ApiClientUtils.buildBaseUrl(this.config.get('TRIPS_SERVICE_URL'));
        this.api = new TripsApi.TripsServiceApi({ client: createTripsClient({ baseUrl, throwOnError: true }) });
    }

    async getTravelHistory(userId: string, authorization: string): Promise<TripsApi.TravelHistoryResponseDto> {
        try {
            const { data } = await this.api.getUserTravelHistory({
                path: { userId },
                headers: { Authorization: authorization },
            });
            return data;
        } catch {
            throw new ServiceUnavailableException('Unable to load travel history');
        }
    }
}
