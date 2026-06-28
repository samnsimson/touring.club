import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import type { ConversationType } from '@tc/database';

export class ConversationDto {
    @ApiProperty({ example: 'conversation_abc123' })
    id!: string;

    @ApiProperty({ example: 'direct', enum: ['direct', 'group', 'trip'] })
    type!: ConversationType;

    @ApiProperty({ example: null, nullable: true })
    tripId!: string | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class CreateDirectConversationDto {
    @ApiProperty({ example: 'usr_abc123' })
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    participantUserId!: string;
}

export class CreateConversationResponseDto {
    @ApiProperty({ type: ConversationDto })
    conversation!: ConversationDto;
}

export class ListConversationsResponseDto {
    @ApiProperty({ type: [ConversationDto] })
    conversations!: ConversationDto[];
}
