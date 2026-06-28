import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpClient, isHttpError } from '@tc/common';
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
    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpClient,
    ) {}

    async getTravelHistory(userId: string, authorization: string): Promise<TravelHistoryApiResponse> {
        const baseUrl = this.config.get('TRIPS_SERVICE_URL');

        try {
            const response = await this.http.get<TravelHistoryApiResponse>(`${baseUrl}/api/v1/trips/users/${encodeURIComponent(userId)}/travel-history`, {
                headers: { Authorization: authorization },
            });
            return response.data;
        } catch (error) {
            if (isHttpError(error) && error.response) {
                throw new ServiceUnavailableException('Unable to load travel history');
            }
            throw error;
        }
    }
}
