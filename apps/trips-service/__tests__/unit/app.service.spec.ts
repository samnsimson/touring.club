import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Trip } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { TripRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let trips: jest.Mocked<Pick<TripRepository, 'create' | 'save' | 'findByOrganizerId'>>;

    beforeAll(async () => {
        trips = {
            create: jest.fn((data) => data as Trip),
            save: jest.fn(async (trip) => ({
                ...trip,
                id: 'trip-1',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
                updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            })),
            findByOrganizerId: jest.fn(),
        };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: TripRepository, useValue: trips }],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
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
            trips.findByOrganizerId.mockResolvedValue([
                {
                    id: 'trip-1',
                    organizerId: 'organizer-1',
                    title: 'Desert Loop',
                    description: null,
                    destination: 'Arizona, USA',
                    meetingLocation: null,
                    startDate: new Date('2026-08-01T09:00:00.000Z'),
                    endDate: new Date('2026-08-05T18:00:00.000Z'),
                    capacity: 8,
                    visibility: 'private',
                    status: 'draft',
                    coverImageUrls: [],
                    categories: [],
                    tags: [],
                    createdAt: new Date('2026-01-01T00:00:00.000Z'),
                    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
                    deletedAt: null,
                },
            ]);
            const result = await service.listMyTrips('organizer-1');
            expect(trips.findByOrganizerId).toHaveBeenCalledWith('organizer-1');
            expect(result.trips).toHaveLength(1);
            expect(result.trips[0].title).toBe('Desert Loop');
        });
    });
});
