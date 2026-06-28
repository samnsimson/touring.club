import { Injectable } from '@nestjs/common';
import { Profile } from '@tc/database';
import { UpdateProfileDto } from './dto';
import { ProfileRepository } from './repositories';

@Injectable()
export class AppService {
    constructor(private readonly profiles: ProfileRepository) {}

    async getProfile(userId: string) {
        const profile = await this.profiles.findOrCreateByUserId(userId);
        return { profile: this.toDto(profile) };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const profile = await this.profiles.findOrCreateByUserId(userId);
        if (dto.biography !== undefined) profile.biography = dto.biography;
        if (dto.interests !== undefined) profile.interests = dto.interests;
        if (dto.privacySettings !== undefined) {
            profile.privacySettings = { ...profile.privacySettings, ...dto.privacySettings };
        }
        const saved = await this.profiles.save(profile);
        return { profile: this.toDto(saved) };
    }

    private toDto(profile: Profile) {
        return {
            userId: profile.userId,
            biography: profile.biography,
            interests: profile.interests,
            privacySettings: profile.privacySettings,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
