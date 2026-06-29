import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
    @ApiProperty({ example: 'Jane Doe' })
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    name!: string;

    @ApiProperty({ example: 'jane@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Str0ngPass!', minLength: 8 })
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string;

    @ApiProperty({ example: 'janedoe', minLength: 3, maxLength: 16 })
    @IsString()
    @MinLength(3)
    @MaxLength(16)
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'username must contain only letters and numbers' })
    username!: string;

    @ApiPropertyOptional({ example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    displayUsername?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ example: 'https://example.com/welcome' })
    @IsOptional()
    @IsString()
    callbackURL?: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}
