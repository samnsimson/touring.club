import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentSession } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import {
    CreateConversationResponseDto,
    CreateDirectConversationDto,
    ListConversationsResponseDto,
    ListMessagesResponseDto,
    SendMessageDto,
    SendMessageResponseDto,
} from './dto';

@ApiTags('Conversations')
@Controller('conversations')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    @ApiResource({ type: CreateConversationResponseDto, operationId: 'createDirectConversation', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async createDirectConversation(@CurrentSession('userId') userId: string, @Body() dto: CreateDirectConversationDto) {
        return this.appService.createDirectConversation(userId, dto);
    }

    @Get()
    @ApiResource({ type: ListConversationsResponseDto, operationId: 'listConversations', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listConversations(@CurrentSession('userId') userId: string) {
        return this.appService.listConversations(userId);
    }

    @Get(':conversationId/messages')
    @ApiResource({ type: ListMessagesResponseDto, operationId: 'listMessages', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async listMessages(@CurrentSession('userId') userId: string, @Param('conversationId') conversationId: string) {
        return this.appService.listMessages(userId, conversationId);
    }

    @Post(':conversationId/messages')
    @ApiResource({ type: SendMessageResponseDto, operationId: 'sendMessage', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async sendMessage(@CurrentSession('userId') userId: string, @Param('conversationId') conversationId: string, @Body() dto: SendMessageDto) {
        return this.appService.sendMessage(userId, conversationId, dto);
    }
}
