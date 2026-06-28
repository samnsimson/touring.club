import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

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
