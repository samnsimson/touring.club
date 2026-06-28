import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { defaultPrivacySettings, Profile } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { TripsClient } from '../../src/app/clients';
import { ProfileRepository, UserRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let profiles: jest.Mocked<Pick<ProfileRepository, 'findOrCreateByUserId' | 'findByUserId' | 'update'>>;
    let users: jest.Mocked<Pick<UserRepository, 'findById'>>;
    let tripsClient: jest.Mocked<Pick<TripsClient, 'getTravelHistory'>>;

    beforeAll(async () => {
        profiles = {
            findOrCreateByUserId: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(async () => ({ affected: 1, raw: [], generatedMaps: [] })),
        };
        users = {
            findById: jest.fn(),
        };
        tripsClient = {
            getTravelHistory: jest.fn(),
        };

        const app = await Test.createTestingModule({
            providers: [
                AppService,
                { provide: ProfileRepository, useValue: profiles },
                { provide: UserRepository, useValue: users },
                { provide: TripsClient, useValue: tripsClient },
            ],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const storedProfile: Profile = {
        userId: 'user-1',
        avatarUrl: null,
        biography: 'Hello',
        interests: ['Hiking'],
        privacySettings: defaultPrivacySettings(),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    describe('getProfile', () => {
        it('returns an existing profile', async () => {
            profiles.findOrCreateByUserId.mockResolvedValue(storedProfile);
            const result = await service.getProfile('user-1');
            expect(profiles.findOrCreateByUserId).toHaveBeenCalledWith('user-1');
            expect(result.profile.userId).toBe('user-1');
            expect(result.profile.biography).toBe('Hello');
        });
    });

    describe('updateProfile', () => {
        it('skips update when dto has no fields', async () => {
            profiles.findOrCreateByUserId.mockResolvedValue(storedProfile);
            profiles.findByUserId.mockResolvedValue(storedProfile);
            const result = await service.updateProfile('user-1', {});
            expect(profiles.update).not.toHaveBeenCalled();
            expect(result.profile.userId).toBe('user-1');
        });

        it('ignores privacy settings when no stored profile exists', async () => {
            profiles.findOrCreateByUserId.mockResolvedValue(storedProfile);
            profiles.findByUserId.mockResolvedValue(null);
            await service.updateProfile('user-1', { privacySettings: { showEmail: true } });
            expect(profiles.update).not.toHaveBeenCalled();
        });

        it('updates profile fields', async () => {
            const updatedProfile = {
                ...storedProfile,
                avatarUrl: 'https://cdn.touring.club/avatars/user-1.png',
                biography: 'Updated',
                interests: ['Road Trips'],
                privacySettings: { showEmail: true, showTravelHistory: true },
            };
            profiles.findOrCreateByUserId.mockResolvedValueOnce({ ...storedProfile }).mockResolvedValueOnce(updatedProfile);
            profiles.findByUserId.mockResolvedValue({ ...storedProfile });
            const result = await service.updateProfile('user-1', {
                avatarUrl: 'https://cdn.touring.club/avatars/user-1.png',
                biography: 'Updated',
                interests: ['Road Trips'],
                privacySettings: { showEmail: true },
            });
            expect(profiles.update).toHaveBeenCalledWith(
                { userId: 'user-1' },
                {
                    avatarUrl: 'https://cdn.touring.club/avatars/user-1.png',
                    biography: 'Updated',
                    interests: ['Road Trips'],
                    privacySettings: { showEmail: true, showTravelHistory: true },
                },
            );
            expect(result.profile.biography).toBe('Updated');
        });
    });

    describe('getTravelHistory', () => {
        it('returns trips from trips-service', async () => {
            tripsClient.getTravelHistory.mockResolvedValue({
                trips: [
                    {
                        id: 'trip-1',
                        title: 'Pacific Coast Highway',
                        destination: 'California, USA',
                        startDate: '2026-07-01T09:00:00.000Z',
                        endDate: '2026-07-07T18:00:00.000Z',
                    },
                ],
            });
            const result = await service.getTravelHistory('user-1', 'Bearer user-1');
            expect(tripsClient.getTravelHistory).toHaveBeenCalledWith('user-1', 'Bearer user-1');
            expect(result.trips).toHaveLength(1);
            expect(result.trips[0].title).toBe('Pacific Coast Highway');
        });
    });

    describe('getPublicProfile', () => {
        it('returns a public profile with optional email and travel history', async () => {
            users.findById.mockResolvedValue({
                id: 'user-1',
                name: 'Jane Doe',
                email: 'jane@touring.club.test',
                username: 'janedoe',
                image: null,
            } as never);
            profiles.findByUserId.mockResolvedValue({
                ...storedProfile,
                privacySettings: { showEmail: true, showTravelHistory: true },
            });
            tripsClient.getTravelHistory.mockResolvedValue({ trips: [] });
            const result = await service.getPublicProfile('user-1', 'Bearer viewer-1');
            expect(result.profile.email).toBe('jane@touring.club.test');
            expect(result.profile.travelHistory).toEqual({ trips: [] });
            expect(tripsClient.getTravelHistory).toHaveBeenCalledWith('user-1', 'Bearer viewer-1');
        });

        it('throws when the user does not exist', async () => {
            users.findById.mockResolvedValue(null);
            await expect(service.getPublicProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
        });

        it('uses default privacy settings and user image when no stored profile exists', async () => {
            users.findById.mockResolvedValue({
                id: 'user-1',
                name: 'Jane Doe',
                email: 'jane@touring.club.test',
                username: 'janedoe',
                image: 'https://cdn.touring.club/avatars/user-1.png',
            } as never);
            profiles.findByUserId.mockResolvedValue(null);
            tripsClient.getTravelHistory.mockResolvedValue({ trips: [] });
            const result = await service.getPublicProfile('user-1', 'Bearer viewer-1');
            expect(result.profile.avatarUrl).toBe('https://cdn.touring.club/avatars/user-1.png');
            expect(result.profile.email).toBeUndefined();
            expect(result.profile.travelHistory).toEqual({ trips: [] });
        });

        it('omits email and travel history when privacy settings hide them', async () => {
            users.findById.mockResolvedValue({
                id: 'user-1',
                name: 'Jane Doe',
                email: 'jane@touring.club.test',
                username: 'janedoe',
                image: null,
            } as never);
            profiles.findByUserId.mockResolvedValue({
                ...storedProfile,
                privacySettings: { showEmail: false, showTravelHistory: false },
            });
            const result = await service.getPublicProfile('user-1', 'Bearer viewer-1');
            expect(result.profile.email).toBeUndefined();
            expect(result.profile.travelHistory).toBeUndefined();
            expect(tripsClient.getTravelHistory).not.toHaveBeenCalled();
        });
    });
});
