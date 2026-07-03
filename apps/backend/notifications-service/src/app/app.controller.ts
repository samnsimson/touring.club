import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentSession } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { CreateNotificationDto, CreateNotificationResponseDto, ListNotificationsResponseDto, MarkNotificationReadResponseDto } from './dto';

@ApiTags('Notifications')
@Controller('notifications')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiResource({ type: ListNotificationsResponseDto, operationId: 'listNotifications', status: HttpStatus.OK, protected: true })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listNotifications(@CurrentSession('userId') userId: string) {
        return this.appService.listNotifications(userId);
    }

    @Post('internal')
    @ApiResource({ type: CreateNotificationResponseDto, operationId: 'createNotification', status: HttpStatus.CREATED, protected: true })
    @ApiResourceExceptions(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED)
    async createNotification(@Body() dto: CreateNotificationDto) {
        return this.appService.createNotification(dto);
    }

    @Patch(':notificationId/read')
    @ApiResource({ type: MarkNotificationReadResponseDto, operationId: 'markNotificationRead', status: HttpStatus.OK, protected: true })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async markNotificationRead(@CurrentSession('userId') userId: string, @Param('notificationId') notificationId: string) {
        return this.appService.markNotificationRead(userId, notificationId);
    }
}
