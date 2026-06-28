import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Trip, TripMembership } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { TripMembershipRepository, TripRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let trips: jest.Mocked<
        Pick<
            TripRepository,
            'create' | 'save' | 'findByOrganizerId' | 'findByIdForOrganizer' | 'findPublishedPublic' | 'findPublicById' | 'findPublishedById' | 'update'
        >
    >;
    let memberships: jest.Mocked<
        Pick<TripMembershipRepository, 'create' | 'save' | 'findByTripId' | 'findByTripAndUser' | 'findByIdForTrip' | 'countActiveMembers' | 'update'>
    >;

    const baseTrip: Trip = {
        id: 'trip-1',
        organizerId: 'organizer-1',
        title: 'Pacific Coast Highway',
        description: null,
        destination: 'California, USA',
        meetingLocation: null,
        startDate: new Date('2026-07-01T09:00:00.000Z'),
        endDate: new Date('2026-07-07T18:00:00.000Z'),
        capacity: 12,
        visibility: 'public',
        status: 'draft',
        coverImageUrls: [],
        categories: [],
        tags: [],
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
    };

    const baseMembership: TripMembership = {
        id: 'membership-1',
        tripId: 'trip-1',
        userId: 'participant-1',
        status: 'active',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        deletedAt: null,
    };

    beforeAll(async () => {
        trips = {
            create: jest.fn((data) => data as Trip),
            save: jest.fn(async (trip) => ({ ...baseTrip, ...trip, id: 'trip-1' })),
            findByOrganizerId: jest.fn(),
            findByIdForOrganizer: jest.fn(),
            findPublishedPublic: jest.fn(),
            findPublicById: jest.fn(),
            findPublishedById: jest.fn(),
            update: jest.fn(async () => ({ affected: 1, raw: [], generatedMaps: [] })),
        };
        memberships = {
            create: jest.fn((data) => data as TripMembership),
            save: jest.fn(async (membership) => ({ ...baseMembership, ...membership, id: 'membership-1' })),
            findByTripId: jest.fn(),
            findByTripAndUser: jest.fn(),
            findByIdForTrip: jest.fn(),
            countActiveMembers: jest.fn(),
            update: jest.fn(async () => ({ affected: 1, raw: [], generatedMaps: [] })),
        };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: TripRepository, useValue: trips }, { provide: TripMembershipRepository, useValue: memberships }],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        trips.findByIdForOrganizer.mockResolvedValue({ ...baseTrip });
    });

    describe('createTrip', () => {
        it('creates a draft trip for the organizer', async () => {
            const dto = {
                title: 'Pacific Coast Highway',
                destination: 'California, USA',
                startDate: '2026-07-01T09:00:00.000Z',
                endDate: '2026-07-07T18:00:00.000Z',
                capacity: 12,
                visibility: 'public' as const,
            };
            const result = await service.createTrip('organizer-1', dto);
            expect(trips.create).toHaveBeenCalledWith(
                expect.objectContaining({ organizerId: 'organizer-1', title: dto.title, status: 'draft', visibility: 'public' }),
            );
            expect(result.trip.id).toBe('trip-1');
            expect(result.trip.organizerId).toBe('organizer-1');
        });

        it('persists optional trip fields when provided', async () => {
            const dto = {
                title: 'Pacific Coast Highway',
                description: 'A scenic drive',
                destination: 'California, USA',
                meetingLocation: 'San Francisco, CA',
                startDate: '2026-07-01T09:00:00.000Z',
                endDate: '2026-07-07T18:00:00.000Z',
                capacity: 12,
                visibility: 'public' as const,
                coverImageUrls: ['https://cdn.touring.club/trips/cover.png'],
                categories: ['Road Trip'],
                tags: ['coastal'],
            };
            await service.createTrip('organizer-1', dto);
            expect(trips.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    description: 'A scenic drive',
                    meetingLocation: 'San Francisco, CA',
                    coverImageUrls: ['https://cdn.touring.club/trips/cover.png'],
                    categories: ['Road Trip'],
                    tags: ['coastal'],
                }),
            );
        });

        it('rejects trips where the end date is not after the start date', async () => {
            const dto = {
                title: 'Invalid Trip',
                destination: 'Nowhere',
                startDate: '2026-07-07T18:00:00.000Z',
                endDate: '2026-07-01T09:00:00.000Z',
                capacity: 4,
                visibility: 'private' as const,
            };
            await expect(service.createTrip('organizer-1', dto)).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('listMyTrips', () => {
        it('returns trips for the organizer', async () => {
            trips.findByOrganizerId.mockResolvedValue([{ ...baseTrip, title: 'Desert Loop', destination: 'Arizona, USA' }]);
            const result = await service.listMyTrips('organizer-1');
            expect(trips.findByOrganizerId).toHaveBeenCalledWith('organizer-1');
            expect(result.trips).toHaveLength(1);
            expect(result.trips[0].title).toBe('Desert Loop');
        });
    });

    describe('getTrip', () => {
        it('returns an owned trip', async () => {
            const result = await service.getTrip('organizer-1', 'trip-1');
            expect(trips.findByIdForOrganizer).toHaveBeenCalledWith('trip-1', 'organizer-1');
            expect(result.trip.id).toBe('trip-1');
        });

        it('throws when the trip is not found', async () => {
            trips.findByIdForOrganizer.mockResolvedValue(null);
            await expect(service.getTrip('organizer-1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('updateTrip', () => {
        it('updates editable trip fields', async () => {
            trips.findByIdForOrganizer.mockResolvedValueOnce({ ...baseTrip }).mockResolvedValueOnce({ ...baseTrip, title: 'Updated Title' });
            const result = await service.updateTrip('organizer-1', 'trip-1', { title: 'Updated Title' });
            expect(trips.update).toHaveBeenCalledWith({ id: 'trip-1', organizerId: 'organizer-1' }, { title: 'Updated Title' });
            expect(result.trip.title).toBe('Updated Title');
        });

        it('updates all supported trip fields', async () => {
            trips.findByIdForOrganizer.mockResolvedValueOnce({ ...baseTrip }).mockResolvedValueOnce({
                ...baseTrip,
                title: 'Updated Title',
                description: 'Updated description',
                destination: 'Oregon, USA',
                meetingLocation: 'Portland, OR',
                capacity: 8,
                visibility: 'private',
                coverImageUrls: ['https://cdn.touring.club/trips/updated.png'],
                categories: ['Camping'],
                tags: ['forest'],
            });
            await service.updateTrip('organizer-1', 'trip-1', {
                title: 'Updated Title',
                description: 'Updated description',
                destination: 'Oregon, USA',
                meetingLocation: 'Portland, OR',
                startDate: '2026-08-01T09:00:00.000Z',
                endDate: '2026-08-07T18:00:00.000Z',
                capacity: 8,
                visibility: 'private',
                coverImageUrls: ['https://cdn.touring.club/trips/updated.png'],
                categories: ['Camping'],
                tags: ['forest'],
            });
            expect(trips.update).toHaveBeenCalledWith(
                { id: 'trip-1', organizerId: 'organizer-1' },
                {
                    title: 'Updated Title',
                    description: 'Updated description',
                    destination: 'Oregon, USA',
                    meetingLocation: 'Portland, OR',
                    startDate: new Date('2026-08-01T09:00:00.000Z'),
                    endDate: new Date('2026-08-07T18:00:00.000Z'),
                    capacity: 8,
                    visibility: 'private',
                    coverImageUrls: ['https://cdn.touring.club/trips/updated.png'],
                    categories: ['Camping'],
                    tags: ['forest'],
                },
            );
        });

        it('rejects updates to cancelled trips', async () => {
            trips.findByIdForOrganizer.mockResolvedValue({ ...baseTrip, status: 'cancelled' });
            await expect(service.updateTrip('organizer-1', 'trip-1', { title: 'Nope' })).rejects.toBeInstanceOf(BadRequestException);
        });

        it('skips update when dto has no fields', async () => {
            const result = await service.updateTrip('organizer-1', 'trip-1', {});
            expect(trips.update).not.toHaveBeenCalled();
            expect(result.trip.id).toBe('trip-1');
        });

        it('rejects updates with an invalid date range', async () => {
            await expect(
                service.updateTrip('organizer-1', 'trip-1', {
                    startDate: '2026-07-07T18:00:00.000Z',
                    endDate: '2026-07-01T09:00:00.000Z',
                }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('publishTrip', () => {
        it('transitions a draft trip to published', async () => {
            trips.findByIdForOrganizer.mockResolvedValueOnce({ ...baseTrip }).mockResolvedValueOnce({ ...baseTrip, status: 'published' });
            const result = await service.publishTrip('organizer-1', 'trip-1');
            expect(trips.update).toHaveBeenCalledWith({ id: 'trip-1', organizerId: 'organizer-1' }, { status: 'published' });
            expect(result.trip.status).toBe('published');
        });
    });

    describe('cancelTrip', () => {
        it('transitions a published trip to cancelled', async () => {
            trips.findByIdForOrganizer.mockResolvedValueOnce({ ...baseTrip, status: 'published' }).mockResolvedValueOnce({ ...baseTrip, status: 'cancelled' });
            const result = await service.cancelTrip('organizer-1', 'trip-1');
            expect(result.trip.status).toBe('cancelled');
        });
    });

    describe('archiveTrip', () => {
        it('transitions a cancelled trip to archived', async () => {
            trips.findByIdForOrganizer.mockResolvedValueOnce({ ...baseTrip, status: 'cancelled' }).mockResolvedValueOnce({ ...baseTrip, status: 'archived' });
            const result = await service.archiveTrip('organizer-1', 'trip-1');
            expect(result.trip.status).toBe('archived');
        });
    });

    describe('discoverTrips', () => {
        it('returns published public trips matching filters', async () => {
            trips.findPublishedPublic.mockResolvedValue([{ ...baseTrip, status: 'published' }]);
            const result = await service.discoverTrips({ destination: 'California' });
            expect(trips.findPublishedPublic).toHaveBeenCalledWith({ destination: 'California' });
            expect(result.trips).toHaveLength(1);
            expect(result.trips[0].status).toBe('published');
        });
    });

    describe('getPublicTrip', () => {
        it('returns a published public trip', async () => {
            trips.findPublicById.mockResolvedValue({ ...baseTrip, status: 'published' });
            const result = await service.getPublicTrip('trip-1');
            expect(result.trip.id).toBe('trip-1');
        });

        it('throws when the trip is not publicly discoverable', async () => {
            trips.findPublicById.mockResolvedValue(null);
            await expect(service.getPublicTrip('missing')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('joinTrip', () => {
        it('creates an active membership for a published public trip', async () => {
            trips.findPublishedById.mockResolvedValue({ ...baseTrip, status: 'published', visibility: 'public' });
            memberships.findByTripAndUser.mockResolvedValue(null);
            memberships.countActiveMembers.mockResolvedValue(0);
            const result = await service.joinTrip('participant-1', 'trip-1');
            expect(memberships.create).toHaveBeenCalledWith(expect.objectContaining({ tripId: 'trip-1', userId: 'participant-1', status: 'active' }));
            expect(result.membership.status).toBe('active');
        });

        it('creates a pending membership for a published private trip', async () => {
            trips.findPublishedById.mockResolvedValue({ ...baseTrip, status: 'published', visibility: 'private' });
            memberships.findByTripAndUser.mockResolvedValue(null);
            const result = await service.joinTrip('participant-1', 'trip-1');
            expect(memberships.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
            expect(result.membership.status).toBe('pending');
        });

        it('rejects when the user is already a member', async () => {
            trips.findPublishedById.mockResolvedValue({ ...baseTrip, status: 'published' });
            memberships.findByTripAndUser.mockResolvedValue({ ...baseMembership, status: 'active' });
            await expect(service.joinTrip('participant-1', 'trip-1')).rejects.toBeInstanceOf(ConflictException);
        });

        it('rejects when the organizer tries to join their own trip', async () => {
            trips.findPublishedById.mockResolvedValue({ ...baseTrip, status: 'published' });
            await expect(service.joinTrip('organizer-1', 'trip-1')).rejects.toBeInstanceOf(BadRequestException);
        });

        it('reactivates a former member with a new membership status', async () => {
            trips.findPublishedById.mockResolvedValue({ ...baseTrip, status: 'published', visibility: 'public' });
            memberships.findByTripAndUser
                .mockResolvedValueOnce({ ...baseMembership, status: 'left' })
                .mockResolvedValueOnce({ ...baseMembership, status: 'active' });
            memberships.countActiveMembers.mockResolvedValue(0);
            const result = await service.joinTrip('participant-1', 'trip-1');
            expect(memberships.update).toHaveBeenCalledWith({ id: 'membership-1' }, { status: 'active' });
            expect(memberships.create).not.toHaveBeenCalled();
            expect(result.membership.status).toBe('active');
        });

        it('rejects when the trip is at capacity', async () => {
            trips.findPublishedById.mockResolvedValue({ ...baseTrip, status: 'published', visibility: 'public', capacity: 1 });
            memberships.findByTripAndUser.mockResolvedValue(null);
            memberships.countActiveMembers.mockResolvedValue(1);
            await expect(service.joinTrip('participant-1', 'trip-1')).rejects.toBeInstanceOf(BadRequestException);
        });

        it('throws when the trip is not joinable', async () => {
            trips.findPublishedById.mockResolvedValue(null);
            await expect(service.joinTrip('participant-1', 'trip-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('leaveTrip', () => {
        it('marks an active membership as left', async () => {
            memberships.findByTripAndUser
                .mockResolvedValueOnce({ ...baseMembership, status: 'active' })
                .mockResolvedValueOnce({ ...baseMembership, status: 'left' });
            const result = await service.leaveTrip('participant-1', 'trip-1');
            expect(memberships.update).toHaveBeenCalledWith({ id: 'membership-1' }, { status: 'left' });
            expect(result.membership.status).toBe('left');
        });

        it('throws when the membership is not open', async () => {
            memberships.findByTripAndUser.mockResolvedValue({ ...baseMembership, status: 'left' });
            await expect(service.leaveTrip('participant-1', 'trip-1')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('throws when the membership does not exist', async () => {
            memberships.findByTripAndUser.mockResolvedValue(null);
            await expect(service.leaveTrip('participant-1', 'trip-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('listTripMembers', () => {
        it('returns members for an owned trip', async () => {
            memberships.findByTripId.mockResolvedValue([{ ...baseMembership }]);
            const result = await service.listTripMembers('organizer-1', 'trip-1');
            expect(memberships.findByTripId).toHaveBeenCalledWith('trip-1');
            expect(result.members).toHaveLength(1);
            expect(result.members[0].id).toBe('membership-1');
        });
    });

    describe('approveMembership', () => {
        it('approves a pending membership when capacity allows', async () => {
            trips.findByIdForOrganizer.mockResolvedValue({ ...baseTrip, status: 'published' });
            memberships.findByIdForTrip
                .mockResolvedValueOnce({ ...baseMembership, status: 'pending' })
                .mockResolvedValueOnce({ ...baseMembership, status: 'active' });
            memberships.countActiveMembers.mockResolvedValue(0);
            const result = await service.approveMembership('organizer-1', 'trip-1', 'membership-1');
            expect(result.membership.status).toBe('active');
        });

        it('rejects approving a non-pending membership', async () => {
            trips.findByIdForOrganizer.mockResolvedValue({ ...baseTrip, status: 'published' });
            memberships.findByIdForTrip.mockResolvedValue({ ...baseMembership, status: 'active' });
            await expect(service.approveMembership('organizer-1', 'trip-1', 'membership-1')).rejects.toBeInstanceOf(BadRequestException);
        });

        it('rejects approval when the trip is at capacity', async () => {
            trips.findByIdForOrganizer.mockResolvedValue({ ...baseTrip, status: 'published', capacity: 1 });
            memberships.findByIdForTrip.mockResolvedValue({ ...baseMembership, status: 'pending' });
            memberships.countActiveMembers.mockResolvedValue(1);
            await expect(service.approveMembership('organizer-1', 'trip-1', 'membership-1')).rejects.toBeInstanceOf(BadRequestException);
        });

        it('throws when the membership does not exist', async () => {
            memberships.findByIdForTrip.mockResolvedValue(null);
            await expect(service.approveMembership('organizer-1', 'trip-1', 'membership-1')).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('rejectMembership', () => {
        it('rejects a pending membership', async () => {
            memberships.findByIdForTrip
                .mockResolvedValueOnce({ ...baseMembership, status: 'pending' })
                .mockResolvedValueOnce({ ...baseMembership, status: 'rejected' });
            const result = await service.rejectMembership('organizer-1', 'trip-1', 'membership-1');
            expect(memberships.update).toHaveBeenCalledWith({ id: 'membership-1' }, { status: 'rejected' });
            expect(result.membership.status).toBe('rejected');
        });

        it('rejects rejecting a non-pending membership', async () => {
            memberships.findByIdForTrip.mockResolvedValue({ ...baseMembership, status: 'active' });
            await expect(service.rejectMembership('organizer-1', 'trip-1', 'membership-1')).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    describe('removeMembership', () => {
        it('removes an active membership', async () => {
            memberships.findByIdForTrip
                .mockResolvedValueOnce({ ...baseMembership, status: 'active' })
                .mockResolvedValueOnce({ ...baseMembership, status: 'removed' });
            const result = await service.removeMembership('organizer-1', 'trip-1', 'membership-1');
            expect(memberships.update).toHaveBeenCalledWith({ id: 'membership-1' }, { status: 'removed' });
            expect(result.membership.status).toBe('removed');
        });

        it('rejects removing a non-active membership', async () => {
            memberships.findByIdForTrip.mockResolvedValue({ ...baseMembership, status: 'pending' });
            await expect(service.removeMembership('organizer-1', 'trip-1', 'membership-1')).rejects.toBeInstanceOf(BadRequestException);
        });
    });
});
