import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, TripMembership, type DataSource } from '@tc/database';

@Injectable()
export class TripMembershipRepository extends BaseRepository<TripMembership> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(TripMembership, dataSource);
    }

    findByTripId(tripId: string) {
        return this.find({ where: { tripId }, order: { createdAt: 'ASC' } });
    }

    findByTripAndUser(tripId: string, userId: string) {
        return this.findOne({ where: { tripId, userId } });
    }

    findByIdForTrip(membershipId: string, tripId: string) {
        return this.findOne({ where: { id: membershipId, tripId } });
    }

    countActiveMembers(tripId: string) {
        return this.count({ where: { tripId, status: 'active' } });
    }
}
