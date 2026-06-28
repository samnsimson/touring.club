import { defaultPrivacySettings, Profile } from '@tc/database';
import { ProfileRepository } from '../../src/app/repositories/profile.repository';

describe('ProfileRepository', () => {
    let repository: jest.Mocked<Pick<ProfileRepository, 'findOne' | 'create' | 'save'>>;
    let profileRepository: ProfileRepository;

    beforeEach(() => {
        repository = {
            findOne: jest.fn(),
            create: jest.fn((value) => value as Profile),
            save: jest.fn(async (value) => value as Profile),
        };
        profileRepository = Object.assign(Object.create(ProfileRepository.prototype), repository);
    });

    describe('findByUserId', () => {
        it('queries by user id', async () => {
            const profile = { userId: 'user-1' } as Profile;
            repository.findOne.mockResolvedValue(profile);
            const result = await profileRepository.findByUserId('user-1');
            expect(repository.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
            expect(result).toBe(profile);
        });
    });

    describe('findOrCreateByUserId', () => {
        it('returns an existing profile', async () => {
            const profile = { userId: 'user-1' } as Profile;
            repository.findOne.mockResolvedValue(profile);
            const result = await profileRepository.findOrCreateByUserId('user-1');
            expect(result).toBe(profile);
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('creates a profile when none exists', async () => {
            repository.findOne.mockResolvedValue(null);
            const result = await profileRepository.findOrCreateByUserId('user-1');
            expect(repository.create).toHaveBeenCalledWith({
                userId: 'user-1',
                biography: null,
                interests: [],
                privacySettings: defaultPrivacySettings(),
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result.userId).toBe('user-1');
        });
    });
});
