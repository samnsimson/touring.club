import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { defaultPrivacySettings, Profile } from '@tc/database';
import type { Repository } from 'typeorm';
import { AppService } from '../../src/app/app.service';

describe('AppService', () => {
    let service: AppService;
    let profiles: jest.Mocked<Pick<Repository<Profile>, 'findOne' | 'create' | 'save'>>;

    beforeAll(async () => {
        profiles = {
            findOne: jest.fn(),
            create: jest.fn((value) => value as Profile),
            save: jest.fn(async (value) => value as Profile),
        };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: getRepositoryToken(Profile), useValue: profiles }],
        }).compile();

        service = app.get<AppService>(AppService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const storedProfile: Profile = {
        userId: 'user-1',
        biography: 'Hello',
        interests: ['Hiking'],
        privacySettings: defaultPrivacySettings(),
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    describe('getProfile', () => {
        it('returns an existing profile', async () => {
            profiles.findOne.mockResolvedValue(storedProfile);
            const result = await service.getProfile('user-1');
            expect(result.profile.userId).toBe('user-1');
            expect(result.profile.biography).toBe('Hello');
        });

        it('creates a profile when none exists', async () => {
            profiles.findOne.mockResolvedValue(null);
            const result = await service.getProfile('user-1');
            expect(profiles.create).toHaveBeenCalledWith({
                userId: 'user-1',
                biography: null,
                interests: [],
                privacySettings: defaultPrivacySettings(),
            });
            expect(profiles.save).toHaveBeenCalled();
            expect(result.profile.userId).toBe('user-1');
        });
    });

    describe('updateProfile', () => {
        it('updates profile fields', async () => {
            profiles.findOne.mockResolvedValue({ ...storedProfile });
            const result = await service.updateProfile('user-1', {
                biography: 'Updated',
                interests: ['Road Trips'],
                privacySettings: { showEmail: true },
            });
            expect(profiles.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    biography: 'Updated',
                    interests: ['Road Trips'],
                    privacySettings: { showEmail: true, showTravelHistory: true },
                }),
            );
            expect(result.profile.biography).toBe('Updated');
        });
    });
});
