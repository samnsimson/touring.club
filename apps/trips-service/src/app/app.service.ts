import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Trip, type TripMembershipStatus } from '@tc/database';
import { CreateTripDto, DiscoverTripsQueryDto, TravelHistoryResponseDto, TripMembershipResponse, TripResponse, UpdateTripDto } from './dto';
import { TripMembershipRepository, TripRepository } from './repositories';
import { TripStatusUtils } from './trip.status';

const OPEN_MEMBERSHIP_STATUSES: TripMembershipStatus[] = ['pending', 'active'];

@Injectable()
export class AppService {
    constructor(
        private readonly trips: TripRepository,
        private readonly memberships: TripMembershipRepository,
    ) {}

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

        return { trip: TripResponse.from(trip) };
    }

    async listMyTrips(organizerId: string) {
        const trips = await this.trips.findByOrganizerId(organizerId);
        return { trips: trips.map((trip) => TripResponse.from(trip)) };
    }

    async getTravelHistory(userId: string) {
        const trips = await this.trips.findTravelHistoryForUser(userId);
        return new TravelHistoryResponseDto(trips);
    }

    async getTrip(organizerId: string, tripId: string) {
        const trip = await this.requireOwnedTrip(organizerId, tripId);
        return { trip: TripResponse.from(trip) };
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

    async discoverTrips(query: DiscoverTripsQueryDto) {
        const trips = await this.trips.findPublishedPublic(query);
        return { trips: trips.map((trip) => TripResponse.from(trip)) };
    }

    async getPublicTrip(tripId: string) {
        const trip = await this.trips.findPublicById(tripId);
        if (!trip) throw new NotFoundException('Trip not found');
        return { trip: TripResponse.from(trip) };
    }

    async joinTrip(userId: string, tripId: string) {
        const trip = await this.requireJoinableTrip(tripId);
        if (trip.organizerId === userId) throw new BadRequestException('Organizers cannot join their own trip');

        const status = trip.visibility === 'public' ? 'active' : 'pending';
        if (status === 'active') await this.assertTripHasCapacity(tripId, trip.capacity);

        const existing = await this.memberships.findByTripAndUser(tripId, userId);
        if (existing) {
            if (OPEN_MEMBERSHIP_STATUSES.includes(existing.status)) {
                throw new ConflictException('Already a member of this trip');
            }
            await this.memberships.update({ id: existing.id }, { status });
            const membership = await this.memberships.findByTripAndUser(tripId, userId);
            return { membership: membership ? TripMembershipResponse.from(membership) : null };
        }

        const membership = await this.memberships.save(this.memberships.create({ trip: { id: tripId } as Trip, userId, status }));
        return { membership: TripMembershipResponse.from(membership) };
    }

    async leaveTrip(userId: string, tripId: string) {
        const membership = await this.requireOpenMembership(tripId, userId);
        await this.memberships.update({ id: membership.id }, { status: 'left' });
        const updated = await this.memberships.findByTripAndUser(tripId, userId);
        return { membership: updated ? TripMembershipResponse.from(updated) : null };
    }

    async listTripMembers(organizerId: string, tripId: string) {
        await this.requireOwnedTrip(organizerId, tripId);
        const members = await this.memberships.findByTripId(tripId);
        return { members: members.map((member) => TripMembershipResponse.from(member)) };
    }

    async approveMembership(organizerId: string, tripId: string, membershipId: string) {
        const trip = await this.requireOwnedTrip(organizerId, tripId);
        const membership = await this.requireMembershipForTrip(tripId, membershipId);
        if (membership.status !== 'pending') throw new BadRequestException('Only pending requests can be approved');
        await this.assertTripHasCapacity(tripId, trip.capacity);
        await this.memberships.update({ id: membershipId }, { status: 'active' });
        const updated = await this.memberships.findByIdForTrip(membershipId, tripId);
        return { membership: updated ? TripMembershipResponse.from(updated) : null };
    }

    async rejectMembership(organizerId: string, tripId: string, membershipId: string) {
        await this.requireOwnedTrip(organizerId, tripId);
        const membership = await this.requireMembershipForTrip(tripId, membershipId);
        if (membership.status !== 'pending') throw new BadRequestException('Only pending requests can be rejected');
        await this.memberships.update({ id: membershipId }, { status: 'rejected' });
        const updated = await this.memberships.findByIdForTrip(membershipId, tripId);
        return { membership: updated ? TripMembershipResponse.from(updated) : null };
    }

    async removeMembership(organizerId: string, tripId: string, membershipId: string) {
        await this.requireOwnedTrip(organizerId, tripId);
        const membership = await this.requireMembershipForTrip(tripId, membershipId);
        if (membership.status !== 'active') throw new BadRequestException('Only active members can be removed');
        await this.memberships.update({ id: membershipId }, { status: 'removed' });
        const updated = await this.memberships.findByIdForTrip(membershipId, tripId);
        return { membership: updated ? TripMembershipResponse.from(updated) : null };
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

    private async requireJoinableTrip(tripId: string) {
        const trip = await this.trips.findPublishedById(tripId);
        if (!trip) throw new NotFoundException('Trip not found');
        return trip;
    }

    private async requireOpenMembership(tripId: string, userId: string) {
        const membership = await this.memberships.findByTripAndUser(tripId, userId);
        if (!membership || !OPEN_MEMBERSHIP_STATUSES.includes(membership.status)) {
            throw new NotFoundException('Membership not found');
        }
        return membership;
    }

    private async requireMembershipForTrip(tripId: string, membershipId: string) {
        const membership = await this.memberships.findByIdForTrip(membershipId, tripId);
        if (!membership) throw new NotFoundException('Membership not found');
        return membership;
    }

    private async assertTripHasCapacity(tripId: string, capacity: number) {
        const activeCount = await this.memberships.countActiveMembers(tripId);
        if (activeCount >= capacity) throw new BadRequestException('Trip is at capacity');
    }

    private assertValidDateRange(startDate: Date, endDate: Date) {
        if (endDate <= startDate) throw new BadRequestException('End date must be after start date');
    }
}
