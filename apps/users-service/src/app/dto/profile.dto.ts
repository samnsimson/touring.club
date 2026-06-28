import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsOptional, IsString, IsUrl, MaxLength, ValidateNested } from 'class-validator';

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

export class ProfileDto {
    @ApiProperty({ example: 'usr_abc123' })
    userId!: string;

    @ApiProperty({ example: 'https://cdn.touring.club/avatars/usr_abc123.png', nullable: true })
    avatarUrl!: string | null;

    @ApiProperty({ example: 'Road trip enthusiast and photographer.', nullable: true })
    biography!: string | null;

    @ApiProperty({ example: ['Hiking', 'Road Trips', 'Photography'], type: [String] })
    interests!: string[];

    @ApiProperty({ type: PrivacySettingsDto })
    privacySettings!: PrivacySettingsDto;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
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
    @ApiProperty({ type: ProfileDto })
    profile!: ProfileDto;
}

export class UpdateProfileResponseDto {
    @ApiProperty({ type: ProfileDto })
    profile!: ProfileDto;
}

export class TravelHistoryTripSummaryDto {
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
}

export class TravelHistoryResponseDto {
    @ApiProperty({ type: [TravelHistoryTripSummaryDto] })
    trips!: TravelHistoryTripSummaryDto[];
}

export class PublicProfileDto {
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

    @ApiPropertyOptional({ type: TravelHistoryResponseDto })
    travelHistory?: TravelHistoryResponseDto;
}

export class GetPublicProfileResponseDto {
    @ApiProperty({ type: PublicProfileDto })
    profile!: PublicProfileDto;
}
