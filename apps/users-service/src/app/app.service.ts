import { Injectable, NotFoundException } from '@nestjs/common';
import { defaultPrivacySettings } from '@tc/database';
import { ProfileResponse, TravelHistoryResponse, UpdateProfileDto } from './dto';
import { ProfileRepository, UserRepository } from './repositories';
import type { Profile } from '@tc/database';

@Injectable()
export class AppService {
    constructor(
        private readonly profiles: ProfileRepository,
        private readonly users: UserRepository,
    ) {}

    async getProfile(userId: string) {
        const profile = await this.profiles.findOrCreateByUserId(userId);
        return { profile: ProfileResponse.from(profile) };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        await this.profiles.findOrCreateByUserId(userId);
        const updates: Partial<Profile> = {};
        if (dto.avatarUrl !== undefined) updates.avatarUrl = dto.avatarUrl;
        if (dto.biography !== undefined) updates.biography = dto.biography;
        if (dto.interests !== undefined) updates.interests = dto.interests;

        const existing = await this.profiles.findByUserId(userId);
        if (dto.privacySettings !== undefined && existing) {
            updates.privacySettings = { ...existing.privacySettings, ...dto.privacySettings };
        }

        if (Object.keys(updates).length > 0) {
            await this.profiles.update({ userId }, updates);
        }

        return this.getProfile(userId);
    }

    async getTravelHistory(userId: string): Promise<TravelHistoryResponse> {
        void userId;
        return TravelHistoryResponse.empty();
    }

    async getPublicProfile(targetUserId: string) {
        const user = await this.users.findById(targetUserId);
        if (!user) throw new NotFoundException('Profile not found');

        const storedProfile = await this.profiles.findByUserId(targetUserId);
        const privacySettings = storedProfile?.privacySettings ?? defaultPrivacySettings();
        const travelHistory = privacySettings.showTravelHistory ? await this.getTravelHistory(targetUserId) : undefined;

        return {
            profile: PublicProfileResponse.from({
                user,
                profile: storedProfile,
                privacySettings,
                travelHistory,
            }),
        };
    }
}
