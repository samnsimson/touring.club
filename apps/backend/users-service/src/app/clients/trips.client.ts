import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ServerApi } from '@tc/server-api';
import type { TravelHistoryResponseDto } from '@tc/server-api/types/trips-service';

@Injectable()
export class TripsClient {
    constructor(private readonly serverApi: ServerApi) {}

    async getTravelHistory(userId: string, authorization: string): Promise<TravelHistoryResponseDto> {
        try {
            const { data } = await this.serverApi.tripsService.getUserTravelHistory({
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
