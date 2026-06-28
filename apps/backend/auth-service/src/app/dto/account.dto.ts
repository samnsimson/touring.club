import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AuthUserResponse } from './auth-user.dto';

export class ChangePasswordDto {
    @ApiProperty({ example: 'OldPass123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    currentPassword!: string;

    @ApiProperty({ example: 'NewPass123!' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    newPassword!: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    revokeOtherSessions?: boolean;
}

export class ChangePasswordResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;
}

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    name?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.png', nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(2048)
    image?: string | null;
}

export class UpdateProfileResponseDto {
    @ApiProperty({ type: AuthUserResponse })
    user!: AuthUserResponse;
}
