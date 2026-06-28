import { BadRequestException, Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StorageService } from '@tc/common';
import { defaultPrivacySettings } from '@tc/database';
import { ProfileResponse, PublicProfileResponse, TravelHistoryResponse, UpdateProfileDto } from './dto';
import { TripsClient } from './clients';
import { ProfileRepository, UserRepository } from './repositories';
import type { Profile } from '@tc/database';

const ALLOWED_AVATAR_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

@Injectable()
export class AppService {
    constructor(
        private readonly profiles: ProfileRepository,
        private readonly users: UserRepository,
        private readonly tripsClient: TripsClient,
        private readonly storage: StorageService,
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

    async uploadAvatar(userId: string, file: { buffer: Buffer; mimetype: string; originalname: string } | undefined) {
        if (!file) throw new BadRequestException('Avatar file is required');
        if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
            throw new UnsupportedMediaTypeException('Avatar must be a PNG, JPEG, or WebP image');
        }

        await this.profiles.findOrCreateByUserId(userId);
        const extension = file.originalname.split('.').pop() ?? 'png';
        const { url } = await this.storage.upload({
            key: `avatars/${userId}/${randomUUID()}.${extension}`,
            body: file.buffer,
            contentType: file.mimetype,
        });

        await this.profiles.update({ userId }, { avatarUrl: url });
        return this.getProfile(userId);
    }

    async getTravelHistory(userId: string, authorization: string): Promise<TravelHistoryResponse> {
        const data = await this.tripsClient.getTravelHistory(userId, authorization);
        return new TravelHistoryResponse({ trips: data.trips });
    }

    async getPublicProfile(targetUserId: string, authorization: string) {
        const user = await this.users.findById(targetUserId);
        if (!user) throw new NotFoundException('Profile not found');

        const storedProfile = await this.profiles.findByUserId(targetUserId);
        const privacySettings = storedProfile?.privacySettings ?? defaultPrivacySettings();
        const travelHistory = privacySettings.showTravelHistory ? await this.getTravelHistory(targetUserId, authorization) : undefined;

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
