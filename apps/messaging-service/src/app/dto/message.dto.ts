import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import type { MessageType } from '@tc/database';

export class MessageDto {
    @ApiProperty({ example: 'message_abc123' })
    id!: string;

    @ApiProperty({ example: 'conversation_abc123' })
    conversationId!: string;

    @ApiProperty({ example: 'usr_abc123' })
    senderId!: string;

    @ApiProperty({ example: 'text', enum: ['text', 'image', 'file', 'system'] })
    messageType!: MessageType;

    @ApiProperty({ example: 'See you at the trailhead!' })
    body!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}

export class SendMessageDto {
    @ApiProperty({ example: 'See you at the trailhead!' })
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    body!: string;
}

export class SendMessageResponseDto {
    @ApiProperty({ type: MessageDto })
    message!: MessageDto;
}

export class ListMessagesResponseDto {
    @ApiProperty({ type: [MessageDto] })
    messages!: MessageDto[];
}
