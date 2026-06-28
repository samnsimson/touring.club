import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';
import { Profile, type PrivacySettings, User } from '@tc/database';

export class PrivacySettingsDto {
    @ApiPropertyOptional({ example: false, default: false })
    @IsOptional()
    @IsBoolean()
    showEmail?: boolean;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    showTravelHistory?: boolean;
}

export type PrivacySettingsResponseInit = Pick<PrivacySettingsResponse, 'showEmail' | 'showTravelHistory'>;

export class PrivacySettingsResponse {
    @ApiProperty({ example: false })
    showEmail!: boolean;

    @ApiProperty({ example: true })
    showTravelHistory!: boolean;

    constructor(data: PrivacySettingsResponseInit) {
        Object.assign(this, data);
    }

    static from(settings: PrivacySettings): PrivacySettingsResponse {
        return new PrivacySettingsResponse({
            showEmail: settings.showEmail,
            showTravelHistory: settings.showTravelHistory,
        });
    }
}

export type ProfileResponseInit = Pick<ProfileResponse, 'userId' | 'avatarUrl' | 'biography' | 'interests' | 'privacySettings' | 'createdAt' | 'updatedAt'> & {
    privacySettings: PrivacySettingsResponseInit;
};

export class ProfileResponse {
    @ApiProperty({ example: 'usr_abc123' })
    userId!: string;

    @ApiProperty({ example: 'https://cdn.touring.club/avatars/usr_abc123.png', nullable: true })
    avatarUrl!: string | null;

    @ApiProperty({ example: 'Road trip enthusiast and photographer.', nullable: true })
    biography!: string | null;

    @ApiProperty({ example: ['Hiking', 'Road Trips', 'Photography'], type: [String] })
    interests!: string[];

    @ApiProperty({ type: PrivacySettingsResponse })
    privacySettings!: PrivacySettingsResponse;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    constructor(data: ProfileResponseInit) {
        Object.assign(this, data);
    }

    static from(profile: Profile): ProfileResponse {
        return new ProfileResponse({
            userId: profile.userId,
            avatarUrl: profile.avatarUrl,
            biography: profile.biography,
            interests: profile.interests,
            privacySettings: PrivacySettingsResponse.from(profile.privacySettings),
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        });
    }
}

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'https://cdn.touring.club/avatars/usr_abc123.png', nullable: true })
    @IsOptional()
    @IsUrl({ require_protocol: true })
    @MaxLength(2048)
    avatarUrl?: string | null;

    @ApiPropertyOptional({ example: 'Road trip enthusiast and photographer.' })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    biography?: string | null;

    @ApiPropertyOptional({ example: ['Hiking', 'Road Trips'], type: [String] })
    @IsOptional()
    @IsArray()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    @MaxLength(64, { each: true })
    interests?: string[];

    @ApiPropertyOptional({ type: PrivacySettingsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => PrivacySettingsDto)
    privacySettings?: PrivacySettingsDto;
}

export class GetProfileResponseDto {
    @ApiProperty({ type: ProfileResponse })
    profile!: ProfileResponse;
}

export class UpdateProfileResponseDto {
    @ApiProperty({ type: ProfileResponse })
    profile!: ProfileResponse;
}

export class UploadAvatarResponseDto {
    @ApiProperty({ type: ProfileResponse })
    profile!: ProfileResponse;
}

export type TravelHistoryTripSummaryResponseInit = Pick<TravelHistoryTripSummaryResponse, 'id' | 'title' | 'destination' | 'startDate' | 'endDate'>;

export class TravelHistoryTripSummaryResponse {
    @ApiProperty({ example: 'trip_abc123' })
    id!: string;

    @ApiProperty({ example: 'Pacific Coast Highway' })
    title!: string;

    @ApiProperty({ example: 'Big Sur, CA' })
    destination!: string;

    @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
    startDate!: string;

    @ApiProperty({ example: '2026-07-07T00:00:00.000Z' })
    endDate!: string;

    constructor(data: TravelHistoryTripSummaryResponseInit) {
        Object.assign(this, data);
    }
}

export class TravelHistoryResponse {
    @ApiProperty({ type: [TravelHistoryTripSummaryResponse] })
    trips!: TravelHistoryTripSummaryResponse[];

    constructor(data: { trips: TravelHistoryTripSummaryResponseInit[] }) {
        this.trips = data.trips.map((trip) => new TravelHistoryTripSummaryResponse(trip));
    }

    static empty(): TravelHistoryResponse {
        return new TravelHistoryResponse({ trips: [] });
    }
}

export type PublicProfileResponseInit = Pick<
    PublicProfileResponse,
    'userId' | 'name' | 'username' | 'avatarUrl' | 'biography' | 'interests' | 'email' | 'travelHistory'
>;

export class PublicProfileResponse {
    @ApiProperty({ example: 'usr_abc123' })
    userId!: string;

    @ApiProperty({ example: 'Jane Doe' })
    name!: string;

    @ApiProperty({ example: 'janedoe', nullable: true })
    username!: string | null;

    @ApiProperty({ example: 'https://cdn.touring.club/avatars/usr_abc123.png', nullable: true })
    avatarUrl!: string | null;

    @ApiProperty({ example: 'Road trip enthusiast and photographer.', nullable: true })
    biography!: string | null;

    @ApiProperty({ example: ['Hiking', 'Road Trips', 'Photography'], type: [String] })
    interests!: string[];

    @ApiPropertyOptional({ example: 'jane@touring.club.test' })
    email?: string;

    @ApiPropertyOptional({ type: TravelHistoryResponse })
    travelHistory?: TravelHistoryResponse;

    constructor(data: PublicProfileResponseInit) {
        Object.assign(this, data);
    }

    static from(params: {
        user: User;
        profile: Profile | null;
        privacySettings: PrivacySettings;
        travelHistory?: TravelHistoryResponse;
    }): PublicProfileResponse {
        const response = new PublicProfileResponse({
            userId: params.user.id,
            name: params.user.name,
            username: params.user.username,
            avatarUrl: params.profile?.avatarUrl ?? params.user.image,
            biography: params.profile?.biography ?? null,
            interests: params.profile?.interests ?? [],
        });

        if (params.privacySettings.showEmail) response.email = params.user.email;
        if (params.privacySettings.showTravelHistory) response.travelHistory = params.travelHistory;

        return response;
    }
}

export class GetPublicProfileResponseDto {
    @ApiProperty({ type: PublicProfileResponse })
    profile!: PublicProfileResponse;
}
