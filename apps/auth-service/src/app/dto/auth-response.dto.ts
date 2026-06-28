import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthUserLike, AuthUserResponse, AuthUserResponseInit } from './auth-user.dto';

export type AuthSessionResponseInit = AuthUserResponseInit & {
    sessionToken: string;
    accessToken: string;
};

export class AuthSessionResponse extends AuthUserResponse {
    @ApiProperty({ description: 'Better Auth session token; also set as an httpOnly refresh-token cookie' })
    sessionToken!: string;

    @ApiProperty({ description: 'JWT access token; also set as an httpOnly access-token cookie' })
    accessToken!: string;

    constructor(data: AuthSessionResponseInit) {
        super(data);
        this.sessionToken = data.sessionToken;
        this.accessToken = data.accessToken;
    }

    static fromAuth(user: AuthUserLike, sessionToken: string, accessToken: string): AuthSessionResponse {
        return new AuthSessionResponse({
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            username: user.username,
            displayUsername: user.displayUsername,
            role: user.role,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            sessionToken,
            accessToken,
        });
    }
}

export type SignUpResponseInit = AuthUserResponseInit & {
    sessionToken?: string;
    accessToken?: string;
};

export class SignUpResponse extends AuthUserResponse {
    @ApiPropertyOptional({ description: 'Session token; omitted until email is verified' })
    sessionToken?: string;

    @ApiPropertyOptional({ description: 'JWT access token; omitted until email is verified' })
    accessToken?: string;

    constructor(data: SignUpResponseInit) {
        super(data);
        this.sessionToken = data.sessionToken;
        this.accessToken = data.accessToken;
    }

    static fromSignUp(user: AuthUserLike, sessionToken?: string, accessToken?: string): SignUpResponse {
        return new SignUpResponse({
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            username: user.username,
            displayUsername: user.displayUsername,
            role: user.role,
            image: user.image,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            sessionToken,
            accessToken,
        });
    }
}

export class SignInResponse extends AuthSessionResponse {}

export class VerifyEmailResponse extends AuthSessionResponse {}

export class AuthErrorResponseDto {
    @ApiProperty({ example: 'Invalid email or password' })
    message!: string;

    @ApiProperty({ example: 'INVALID_EMAIL_OR_PASSWORD', required: false })
    code?: string;
}
