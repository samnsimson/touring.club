import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserDto {
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
}
