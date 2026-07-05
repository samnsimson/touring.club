import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { TripsServiceApi } from '@tc/api-client';
import { ConfigService } from '@tc/config';

@Injectable()
export class TripsClient {
    private readonly api: TripsServiceApi;

    constructor(private readonly config: ConfigService) {
        this.api = new TripsServiceApi({ baseUrl: `${this.config.get('TRIPS_SERVICE_URL')}/api/v1` });
    }

    async getTravelHistory(userId: string, authorization: string) {
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
