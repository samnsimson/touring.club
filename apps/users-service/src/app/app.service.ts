import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { defaultPrivacySettings, Profile } from '@tc/database';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto';

@Injectable()
export class AppService {
    constructor(@InjectRepository(Profile) private readonly profiles: Repository<Profile>) {}

    async getProfile(userId: string) {
        const profile = await this.findOrCreateProfile(userId);
        return { profile: this.toDto(profile) };
    }

    async updateProfile(userId: string, dto: UpdateProfileDto) {
        const profile = await this.findOrCreateProfile(userId);
        if (dto.biography !== undefined) profile.biography = dto.biography;
        if (dto.interests !== undefined) profile.interests = dto.interests;
        if (dto.privacySettings !== undefined) {
            profile.privacySettings = { ...profile.privacySettings, ...dto.privacySettings };
        }
        const saved = await this.profiles.save(profile);
        return { profile: this.toDto(saved) };
    }

    private async findOrCreateProfile(userId: string): Promise<Profile> {
        const existing = await this.profiles.findOne({ where: { userId } });
        if (existing) return existing;
        const created = this.profiles.create({
            userId,
            biography: null,
            interests: [],
            privacySettings: defaultPrivacySettings(),
        });
        return this.profiles.save(created);
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
