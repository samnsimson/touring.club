import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignInDto {
    @ApiProperty({ example: 'jane@example.com' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Str0ngPass!' })
    @IsString()
    @MinLength(1)
    password!: string;

    @ApiPropertyOptional({ example: true, default: true })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;

    @ApiPropertyOptional({ example: 'https://example.com/dashboard' })
    @IsOptional()
    @IsString()
    callbackURL?: string;
}
