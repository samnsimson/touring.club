import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({ example: 'jane@example.com' })
    @IsEmail()
    email!: string;

    @ApiPropertyOptional({ example: 'https://touring.club/reset-password' })
    @IsOptional()
    @IsUrl()
    redirectTo?: string;
}

export class ResetPasswordDto {
    @ApiProperty({ example: 'Str0ngPass!' })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    newPassword!: string;

    @ApiProperty({ example: 'reset-token-from-email' })
    @IsString()
    @MinLength(1)
    token!: string;
}

export class ForgotPasswordResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;
}

export class ResetPasswordResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;
}
