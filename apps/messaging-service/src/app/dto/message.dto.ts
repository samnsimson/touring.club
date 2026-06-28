import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Message, type MessageType } from '@tc/database';

export type MessageResponseInit = Pick<MessageResponse, 'id' | 'conversationId' | 'senderId' | 'messageType' | 'body' | 'createdAt' | 'updatedAt'>;

export class MessageResponse {
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

    constructor(data: MessageResponseInit) {
        Object.assign(this, data);
    }

    static from(message: Message): MessageResponse {
        return new MessageResponse({
            id: message.id,
            conversationId: message.conversationId,
            senderId: message.senderId,
            messageType: message.messageType,
            body: message.body,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        });
    }
}

export class SendMessageDto {
    @ApiProperty({ example: 'See you at the trailhead!' })
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    body!: string;
}

export class SendMessageResponseDto {
    @ApiProperty({ type: MessageResponse })
    message!: MessageResponse;
}

export class ListMessagesResponseDto {
    @ApiProperty({ type: [MessageResponse] })
    messages!: MessageResponse[];
}
