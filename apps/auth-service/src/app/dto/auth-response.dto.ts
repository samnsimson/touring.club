import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class SignUpResponseDto {
    @ApiPropertyOptional({ nullable: true, description: 'Session token when email is already verified' })
    token!: string | null;

    @ApiProperty({ type: AuthUserDto })
    user!: AuthUserDto;
}

export class SignInResponseDto {
    @ApiProperty({ example: false })
    redirect!: boolean;

    @ApiProperty({ description: 'Bearer or session token' })
    token!: string;

    @ApiPropertyOptional({ nullable: true })
    url?: string | null;

    @ApiProperty({ type: AuthUserDto })
    user!: AuthUserDto;
}

export class VerifyEmailResponseDto {
    @ApiProperty({ example: true })
    status!: boolean;

    @ApiPropertyOptional({ nullable: true, description: 'Session token after successful verification' })
    token!: string | null;

    @ApiProperty({ type: AuthUserDto })
    user!: AuthUserDto;
}

export class AuthErrorResponseDto {
    @ApiProperty({ example: 'Invalid email or password' })
    message!: string;

    @ApiPropertyOptional({ example: 'INVALID_EMAIL_OR_PASSWORD' })
    code?: string;
}
