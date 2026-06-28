import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Trip } from '@tc/database';
import { CreateTripDto, UpdateTripDto } from './dto';
import { TripRepository } from './repositories';
import { TripStatusUtils } from './trip.status';

@Injectable()
export class AppService {
    constructor(private readonly trips: TripRepository) {}

    async createTrip(organizerId: string, dto: CreateTripDto) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        this.assertValidDateRange(startDate, endDate);

        const trip = await this.trips.save(
            this.trips.create({
                organizerId,
                title: dto.title,
                description: dto.description ?? null,
                destination: dto.destination,
                meetingLocation: dto.meetingLocation ?? null,
                startDate,
                endDate,
                capacity: dto.capacity,
                visibility: dto.visibility,
                status: 'draft',
                coverImageUrls: dto.coverImageUrls ?? [],
                categories: dto.categories ?? [],
                tags: dto.tags ?? [],
            }),
        );

        return { trip: this.toDto(trip) };
    }

    async listMyTrips(organizerId: string) {
        const trips = await this.trips.findByOrganizerId(organizerId);
        return { trips: trips.map((trip) => this.toDto(trip)) };
    }

    async getTrip(organizerId: string, tripId: string) {
        const trip = await this.requireOwnedTrip(organizerId, tripId);
        return { trip: this.toDto(trip) };
    }

    async updateTrip(organizerId: string, tripId: string, dto: UpdateTripDto) {
        const trip = await this.requireOwnedTrip(organizerId, tripId);
        TripStatusUtils.assertEditable(trip.status);

        const startDate = dto.startDate ? new Date(dto.startDate) : trip.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : trip.endDate;
        this.assertValidDateRange(startDate, endDate);

        const updates: Partial<Trip> = {};
        if (dto.title !== undefined) updates.title = dto.title;
        if (dto.description !== undefined) updates.description = dto.description;
        if (dto.destination !== undefined) updates.destination = dto.destination;
        if (dto.meetingLocation !== undefined) updates.meetingLocation = dto.meetingLocation;
        if (dto.startDate !== undefined) updates.startDate = startDate;
        if (dto.endDate !== undefined) updates.endDate = endDate;
        if (dto.capacity !== undefined) updates.capacity = dto.capacity;
        if (dto.visibility !== undefined) updates.visibility = dto.visibility;
        if (dto.coverImageUrls !== undefined) updates.coverImageUrls = dto.coverImageUrls;
        if (dto.categories !== undefined) updates.categories = dto.categories;
        if (dto.tags !== undefined) updates.tags = dto.tags;

        if (Object.keys(updates).length > 0) {
            await this.trips.update({ id: tripId, organizerId }, updates);
        }

        return this.getTrip(organizerId, tripId);
    }

    async publishTrip(organizerId: string, tripId: string) {
        return this.transitionTrip(organizerId, tripId, 'published');
    }

    async cancelTrip(organizerId: string, tripId: string) {
        return this.transitionTrip(organizerId, tripId, 'cancelled');
    }

    async archiveTrip(organizerId: string, tripId: string) {
        return this.transitionTrip(organizerId, tripId, 'archived');
    }

    private async transitionTrip(organizerId: string, tripId: string, status: Trip['status']) {
        const trip = await this.requireOwnedTrip(organizerId, tripId);
        TripStatusUtils.assertCanTransition(trip.status, status);
        await this.trips.update({ id: tripId, organizerId }, { status });
        return this.getTrip(organizerId, tripId);
    }

    private async requireOwnedTrip(organizerId: string, tripId: string) {
        const trip = await this.trips.findByIdForOrganizer(tripId, organizerId);
        if (!trip) throw new NotFoundException('Trip not found');
        return trip;
    }

    private assertValidDateRange(startDate: Date, endDate: Date) {
        if (endDate <= startDate) throw new BadRequestException('End date must be after start date');
    }

    private toDto(trip: Trip) {
        return {
            id: trip.id,
            organizerId: trip.organizerId,
            title: trip.title,
            description: trip.description,
            destination: trip.destination,
            meetingLocation: trip.meetingLocation,
            startDate: trip.startDate,
            endDate: trip.endDate,
            capacity: trip.capacity,
            visibility: trip.visibility,
            status: trip.status,
            coverImageUrls: trip.coverImageUrls,
            categories: trip.categories,
            tags: trip.tags,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt,
        };
    }
}
