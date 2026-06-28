import { Body, Controller, Get, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@tc/auth';
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
import { MessagingUtils } from './messaging.utils';

@ApiTags('Conversations')
@Controller('conversations')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    @ApiResource({ type: CreateConversationResponseDto, operationId: 'createDirectConversation', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async createDirectConversation(@Req() req: AuthenticatedRequest, @Body() dto: CreateDirectConversationDto) {
        return this.appService.createDirectConversation(MessagingUtils.getUserId(req), dto);
    }

    @Get()
    @ApiResource({ type: ListConversationsResponseDto, operationId: 'listConversations', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listConversations(@Req() req: AuthenticatedRequest) {
        return this.appService.listConversations(MessagingUtils.getUserId(req));
    }

    @Get(':conversationId/messages')
    @ApiResource({ type: ListMessagesResponseDto, operationId: 'listMessages', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async listMessages(@Req() req: AuthenticatedRequest, @Param('conversationId') conversationId: string) {
        return this.appService.listMessages(MessagingUtils.getUserId(req), conversationId);
    }

    @Post(':conversationId/messages')
    @ApiResource({ type: SendMessageResponseDto, operationId: 'sendMessage', status: HttpStatus.CREATED })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async sendMessage(@Req() req: AuthenticatedRequest, @Param('conversationId') conversationId: string, @Body() dto: SendMessageDto) {
        return this.appService.sendMessage(MessagingUtils.getUserId(req), conversationId, dto);
    }
}
