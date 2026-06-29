import { ApiProperty } from '@nestjs/swagger';
import { Trip } from '@tc/database';

export type TravelHistoryTripSummaryResponseInit = Pick<TravelHistoryTripSummaryResponse, 'id' | 'title' | 'destination' | 'startDate' | 'endDate'>;

export class TravelHistoryTripSummaryResponse {
    @ApiProperty({ example: 'trip_abc123' })
    id!: string;

    @ApiProperty({ example: 'Pacific Coast Highway' })
    title!: string;

    @ApiProperty({ example: 'Big Sur, CA' })
    destination!: string;

    @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
    startDate!: string;

    @ApiProperty({ example: '2026-07-07T00:00:00.000Z' })
    endDate!: string;

    constructor(data: TravelHistoryTripSummaryResponseInit) {
        Object.assign(this, data);
    }

    static from(trip: Trip): TravelHistoryTripSummaryResponse {
        return new TravelHistoryTripSummaryResponse({
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            startDate: trip.startDate.toISOString(),
            endDate: trip.endDate.toISOString(),
        });
    }
}

export class TravelHistoryResponseDto {
    @ApiProperty({ type: [TravelHistoryTripSummaryResponse] })
    trips!: TravelHistoryTripSummaryResponse[];

    constructor(trips: Trip[]) {
        this.trips = trips.map((trip) => TravelHistoryTripSummaryResponse.from(trip));
    }
}
