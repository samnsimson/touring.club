import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class AuthSessionResponseDto extends AuthUserDto {
    @ApiProperty({ description: 'Better Auth session token; also set as an httpOnly refresh-token cookie' })
    sessionToken!: string;

    @ApiProperty({ description: 'JWT access token; also set as an httpOnly access-token cookie' })
    accessToken!: string;
}

export class SignUpResponseDto extends AuthSessionResponseDto {}

export class SignInResponseDto extends AuthSessionResponseDto {}

export class VerifyEmailResponseDto extends AuthSessionResponseDto {}

export class AuthErrorResponseDto {
    @ApiProperty({ example: 'Invalid email or password' })
    message!: string;

    @ApiProperty({ example: 'INVALID_EMAIL_OR_PASSWORD', required: false })
    code?: string;
}
