import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Conversation, type ConversationType } from '@tc/database';

export type ConversationResponseInit = Pick<ConversationResponse, 'id' | 'type' | 'tripId' | 'createdAt' | 'updatedAt'>;

export class ConversationResponse {
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

    constructor(data: ConversationResponseInit) {
        Object.assign(this, data);
    }

    static from(conversation: Conversation): ConversationResponse {
        return new ConversationResponse({
            id: conversation.id,
            type: conversation.type,
            tripId: conversation.tripId,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
        });
    }
}

export class CreateDirectConversationDto {
    @ApiProperty({ example: 'usr_abc123' })
    @IsString()
    @MinLength(1)
    @MaxLength(128)
    participantUserId!: string;
}

export class CreateConversationResponseDto {
    @ApiProperty({ type: ConversationResponse })
    conversation!: ConversationResponse;
}

export class ListConversationsResponseDto {
    @ApiProperty({ type: [ConversationResponse] })
    conversations!: ConversationResponse[];
}
