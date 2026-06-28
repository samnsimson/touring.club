import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, defaultPrivacySettings, Profile, type DataSource } from '@tc/database';

@Injectable()
export class ProfileRepository extends BaseRepository<Profile> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Profile, dataSource);
    }

    findByUserId(userId: string) {
        return this.findOne({ where: { userId } });
    }

    async findOrCreateByUserId(userId: string): Promise<Profile> {
        const existing = await this.findByUserId(userId);
        if (existing) return existing;
        const privacySettings = defaultPrivacySettings();
        const profile = this.create({ userId, biography: null, interests: [], privacySettings });
        return this.save(profile);
    }
}
