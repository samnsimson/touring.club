import { Test } from '@nestjs/testing';
import { defaultPrivacySettings, Profile } from '@tc/database';
import { AppService } from '../../src/app/app.service';
import { ProfileRepository } from '../../src/app/repositories';

describe('AppService', () => {
    let service: AppService;
    let profiles: jest.Mocked<Pick<ProfileRepository, 'findOrCreateByUserId' | 'save'>>;

    beforeAll(async () => {
        profiles = {
            findOrCreateByUserId: jest.fn(),
            save: jest.fn(async (value) => value as Profile),
        };

        const app = await Test.createTestingModule({
            providers: [AppService, { provide: ProfileRepository, useValue: profiles }],
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
            profiles.findOrCreateByUserId.mockResolvedValue(storedProfile);
            const result = await service.getProfile('user-1');
            expect(profiles.findOrCreateByUserId).toHaveBeenCalledWith('user-1');
            expect(result.profile.userId).toBe('user-1');
            expect(result.profile.biography).toBe('Hello');
        });
    });

    describe('updateProfile', () => {
        it('updates profile fields', async () => {
            profiles.findOrCreateByUserId.mockResolvedValue({ ...storedProfile });
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
