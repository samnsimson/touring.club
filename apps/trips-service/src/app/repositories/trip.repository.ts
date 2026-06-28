import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { And, BaseRepository, DataSource, FindOptionsWhere, ILike, In, LessThanOrEqual, MoreThanOrEqual, Not, Raw, Trip } from '@tc/database';
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

    findById(tripId: string) {
        return this.findOne({ where: { id: tripId } });
    }

    findPublishedById(tripId: string) {
        return this.findOne({ where: { id: tripId, status: 'published' } });
    }

    findPublicById(tripId: string) {
        return this.findOne({ where: { id: tripId, status: 'published', visibility: 'public' } });
    }

    findPublishedPublic(filters: DiscoverTripsFilters) {
        const where: FindOptionsWhere<Trip> = { status: 'published', visibility: 'public' };
        if (filters.destination) where.destination = ILike(`%${filters.destination}%`);
        if (filters.startDateFrom && filters.startDateTo) {
            const moreOrEqual = MoreThanOrEqual(new Date(filters.startDateFrom));
            const lessOrEqual = LessThanOrEqual(new Date(filters.startDateTo));
            where.startDate = And(moreOrEqual, lessOrEqual);
        } else if (filters.startDateFrom) where.startDate = MoreThanOrEqual(new Date(filters.startDateFrom));
        else if (filters.startDateTo) where.startDate = LessThanOrEqual(new Date(filters.startDateTo));
        if (filters.category) where.categories = Raw((alias) => `:category = ANY(${alias})`, { category: filters.category });
        if (filters.tag) where.tags = Raw((alias) => `:tag = ANY(${alias})`, { tag: filters.tag });
        return this.find({ where, order: { startDate: 'ASC' } });
    }

    findTravelHistoryForUser(userId: string) {
        return this.find({
            where: [{ organizerId: userId, status: Not('draft') }, { memberships: { userId, status: In(['active', 'left']) } }],
            order: { startDate: 'DESC' },
        });
    }
}
