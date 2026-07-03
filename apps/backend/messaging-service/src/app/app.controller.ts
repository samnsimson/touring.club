import { Body, Controller, Get, Headers, HttpStatus, Param, Post, UploadedFile } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentSession } from '@tc/auth';
import { ApiResourceFileUpload, ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import {
    CreateConversationResponseDto,
    CreateDirectConversationDto,
    ListConversationsResponseDto,
    ListMessagesResponseDto,
    PostTripSystemEventDto,
    PostTripSystemEventResponseDto,
    SendMessageDto,
    SendMessageResponseDto,
    UploadMessageAttachmentResponseDto,
} from './dto';
import type { Express } from 'express';

@ApiTags('Conversations')
@Controller('conversations')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post()
    @ApiResource({ type: CreateConversationResponseDto, operationId: 'createDirectConversation', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async createDirectConversation(@CurrentSession('userId') userId: string, @Body() dto: CreateDirectConversationDto) {
        return this.appService.createDirectConversation(userId, dto);
    }

    @Get()
    @ApiResource({ type: ListConversationsResponseDto, operationId: 'listConversations', status: HttpStatus.OK, protected: true })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listConversations(@CurrentSession('userId') userId: string) {
        return this.appService.listConversations(userId);
    }

    @Get('trips/:tripId')
    @ApiResource({ type: CreateConversationResponseDto, operationId: 'getTripConversation', status: HttpStatus.OK, protected: true })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async getTripConversation(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.getTripConversation(userId, tripId);
    }

    @Get('trips/:tripId/messages')
    @ApiResource({ type: ListMessagesResponseDto, operationId: 'listTripMessages', status: HttpStatus.OK, protected: true })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async listTripMessages(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string) {
        return this.appService.listTripMessages(userId, tripId);
    }

    @Post('trips/:tripId/messages')
    @ApiResource({ type: SendMessageResponseDto, operationId: 'sendTripMessage', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async sendTripMessage(
        @CurrentSession('userId') userId: string,
        @Param('tripId') tripId: string,
        @Body() dto: SendMessageDto,
        @Headers('authorization') authorization: string,
    ) {
        return this.appService.sendTripMessage(userId, tripId, dto, authorization);
    }

    @Post('trips/:tripId/messages/attachment')
    @ApiResourceFileUpload()
    @ApiResource({ type: UploadMessageAttachmentResponseDto, operationId: 'uploadTripMessageAttachment', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    async uploadTripMessageAttachment(
        @CurrentSession('userId') userId: string,
        @Param('tripId') tripId: string,
        @UploadedFile() file: Express.Multer.File,
        @Headers('authorization') authorization: string,
    ) {
        return this.appService.uploadTripMessageAttachment(userId, tripId, file, authorization);
    }

    @Post('internal/trips/:tripId/system-events')
    @ApiResource({ type: PostTripSystemEventResponseDto, operationId: 'postTripSystemEvent', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async postTripSystemEvent(@Param('tripId') tripId: string, @Body() dto: PostTripSystemEventDto) {
        return this.appService.postTripSystemEvent(tripId, dto);
    }

    @Get(':conversationId/messages')
    @ApiResource({ type: ListMessagesResponseDto, operationId: 'listMessages', status: HttpStatus.OK, protected: true })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async listMessages(@CurrentSession('userId') userId: string, @Param('conversationId') conversationId: string) {
        return this.appService.listMessages(userId, conversationId);
    }

    @Post(':conversationId/messages')
    @ApiResource({ type: SendMessageResponseDto, operationId: 'sendMessage', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async sendMessage(
        @CurrentSession('userId') userId: string,
        @Param('conversationId') conversationId: string,
        @Body() dto: SendMessageDto,
        @Headers('authorization') authorization: string,
    ) {
        return this.appService.sendMessage(userId, conversationId, dto, authorization);
    }

    @Post(':conversationId/messages/attachment')
    @ApiResourceFileUpload()
    @ApiResource({ type: UploadMessageAttachmentResponseDto, operationId: 'uploadMessageAttachment', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED, HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    async uploadMessageAttachment(
        @CurrentSession('userId') userId: string,
        @Param('conversationId') conversationId: string,
        @UploadedFile() file: Express.Multer.File,
        @Headers('authorization') authorization: string,
    ) {
        return this.appService.uploadMessageAttachment(userId, conversationId, file, authorization);
    }
}
