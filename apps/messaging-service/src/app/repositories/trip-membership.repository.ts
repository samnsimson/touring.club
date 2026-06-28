import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, TripMembership, type DataSource } from '@tc/database';

@Injectable()
export class TripMembershipRepository extends BaseRepository<TripMembership> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(TripMembership, dataSource);
    }

    findByTripAndUser(tripId: string, userId: string) {
        return this.findOne({ where: { trip: { id: tripId }, userId } });
    }

    findActiveByTripId(tripId: string) {
        return this.find({ where: { trip: { id: tripId }, status: 'active' }, order: { createdAt: 'ASC' } });
    }
}
