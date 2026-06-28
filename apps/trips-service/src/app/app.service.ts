import { BadRequestException, Injectable } from '@nestjs/common';
import { Trip } from '@tc/database';
import { CreateTripDto } from './dto';
import { TripRepository } from './repositories';

@Injectable()
export class AppService {
    constructor(private readonly trips: TripRepository) {}

    async createTrip(organizerId: string, dto: CreateTripDto) {
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (endDate <= startDate) throw new BadRequestException('End date must be after start date');

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
