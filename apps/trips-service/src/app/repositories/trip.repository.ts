import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Trip, type DataSource } from '@tc/database';
import type { DiscoverTripsFilters } from '../dto';

@Injectable()
export class TripRepository extends BaseRepository<Trip> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Trip, dataSource);
    }

    findByOrganizerId(organizerId: string) {
        return this.find({ where: { organizerId }, order: { startDate: 'ASC' } });
    }

    findByIdForOrganizer(tripId: string, organizerId: string) {
        return this.findOne({ where: { id: tripId, organizerId } });
    }

    findPublicById(tripId: string) {
        return this.findOne({ where: { id: tripId, status: 'published', visibility: 'public' } });
    }

    findPublishedPublic(filters: DiscoverTripsFilters) {
        const query = this.createQueryBuilder('trip')
            .where('trip.status = :status', { status: 'published' })
            .andWhere('trip.visibility = :visibility', { visibility: 'public' })
            .orderBy('trip.startDate', 'ASC');

        if (filters.destination) {
            query.andWhere('trip.destination ILIKE :destination', { destination: `%${filters.destination}%` });
        }
        if (filters.startDateFrom) {
            query.andWhere('trip.startDate >= :startDateFrom', { startDateFrom: new Date(filters.startDateFrom) });
        }
        if (filters.startDateTo) {
            query.andWhere('trip.startDate <= :startDateTo', { startDateTo: new Date(filters.startDateTo) });
        }
        if (filters.category) {
            query.andWhere(':category = ANY(trip.categories)', { category: filters.category });
        }
        if (filters.tag) {
            query.andWhere(':tag = ANY(trip.tags)', { tag: filters.tag });
        }

        return query.getMany();
    }
}
