import { Injectable, NotFoundException } from '@nestjs/common';
import { defaultPrivacySettings, Profile } from '@tc/database';
import { GetPublicProfileResponseDto, TravelHistoryResponseDto, UpdateProfileDto } from './dto';
import { ProfileRepository, UserRepository } from './repositories';

@Injectable()
export class AppService {
    constructor(
        private readonly profiles: ProfileRepository,
        private readonly users: UserRepository,
    ) {}

    async getProfile(userId: string) {
        const profile = await this.profiles.findOrCreateByUserId(userId);
        return { profile: this.toDto(profile) };
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

    async getTravelHistory(userId: string): Promise<TravelHistoryResponseDto> {
        void userId;
        return { trips: [] };
    }

    async getPublicProfile(targetUserId: string): Promise<GetPublicProfileResponseDto> {
        const user = await this.users.findById(targetUserId);
        if (!user) throw new NotFoundException('Profile not found');

        const storedProfile = await this.profiles.findByUserId(targetUserId);
        const privacySettings = storedProfile?.privacySettings ?? defaultPrivacySettings();
        const profile: GetPublicProfileResponseDto['profile'] = {
            userId: user.id,
            name: user.name,
            username: user.username,
            avatarUrl: storedProfile?.avatarUrl ?? user.image,
            biography: storedProfile?.biography ?? null,
            interests: storedProfile?.interests ?? [],
        };

        if (privacySettings.showEmail) profile.email = user.email;
        if (privacySettings.showTravelHistory) profile.travelHistory = await this.getTravelHistory(targetUserId);

        return { profile };
    }

    private toDto(profile: Profile) {
        return {
            userId: profile.userId,
            avatarUrl: profile.avatarUrl,
            biography: profile.biography,
            interests: profile.interests,
            privacySettings: profile.privacySettings,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
