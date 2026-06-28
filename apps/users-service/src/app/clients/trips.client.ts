import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@tc/config';

type TravelHistoryTripSummary = {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
};

type TravelHistoryApiResponse = {
    trips: TravelHistoryTripSummary[];
};

@Injectable()
export class TripsClient {
    constructor(private readonly config: ConfigService) {}

    async getTravelHistory(userId: string, authorization: string): Promise<TravelHistoryApiResponse> {
        const baseUrl = this.config.get('TRIPS_SERVICE_URL');
        const response = await fetch(`${baseUrl}/api/v1/trips/users/${encodeURIComponent(userId)}/travel-history`, {
            headers: { Authorization: authorization },
        });

        if (!response.ok) {
            throw new ServiceUnavailableException('Unable to load travel history');
        }

        return (await response.json()) as TravelHistoryApiResponse;
    }
}
