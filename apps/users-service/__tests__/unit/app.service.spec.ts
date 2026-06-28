import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { defaultPrivacySettings, Profile } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { ProfileRepository, UserRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let profiles: jest.Mocked<Pick<ProfileRepository, 'findOrCreateByUserId' | 'findByUserId' | 'update'>>;
    let users: jest.Mocked<Pick<UserRepository, 'findById'>>;

    beforeAll(async () => {
        profiles = {
            findOrCreateByUserId: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(async () => ({ affected: 1, raw: [], generatedMaps: [] })),
        };
        users = {
            findById: jest.fn(),
        };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: ProfileRepository, useValue: profiles }, { provide: UserRepository, useValue: users }],
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
        it('returns an empty trip list', async () => {
            const result = await service.getTravelHistory('user-1');
            expect(result.trips).toEqual([]);
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
            const result = await service.getPublicProfile('user-1');
            expect(result.profile.email).toBe('jane@touring.club.test');
            expect(result.profile.travelHistory).toEqual({ trips: [] });
        });

        it('throws when the user does not exist', async () => {
            users.findById.mockResolvedValue(null);
            await expect(service.getPublicProfile('missing')).rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
