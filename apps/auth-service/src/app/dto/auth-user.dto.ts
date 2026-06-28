import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type AuthUserLike = {
    id: string;
    email: string;
    name: string;
    emailVerified?: boolean;
    username?: string | null;
    displayUsername?: string | null;
    role?: string | null;
    image?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export type AuthUserResponseInit = Pick<
    AuthUserResponse,
    'id' | 'email' | 'name' | 'emailVerified' | 'username' | 'displayUsername' | 'role' | 'image' | 'createdAt' | 'updatedAt'
>;

export class AuthUserResponse {
    @ApiProperty({ example: 'usr_abc123' })
    id!: string;

    @ApiProperty({ example: 'jane@example.com' })
    email!: string;

    @ApiProperty({ example: 'Jane Doe' })
    name!: string;

    @ApiProperty({ example: true, required: false })
    emailVerified?: boolean;

    @ApiPropertyOptional({ example: 'janedoe', nullable: true })
    username?: string | null;

    @ApiPropertyOptional({ example: 'Jane Doe', nullable: true })
    displayUsername?: string | null;

    @ApiPropertyOptional({ example: 'user', nullable: true })
    role?: string | null;

    @ApiPropertyOptional({ nullable: true })
    image?: string | null;

    @ApiProperty({ required: false })
    createdAt?: Date;

    @ApiProperty({ required: false })
    updatedAt?: Date;

    constructor(data: AuthUserResponseInit) {
        Object.assign(this, data);
    }

    static from(user: AuthUserLike): AuthUserResponse {
        return new AuthUserResponse({
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
        });
    }
}
