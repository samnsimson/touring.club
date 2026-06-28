import { Controller, Get, HttpStatus, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentSession } from '@tc/auth';
import { ApiResource, ApiResourceExceptions } from '@tc/utils';
import { AppService } from './app.service';
import { ListNotificationsResponseDto, MarkNotificationReadResponseDto } from './dto';

@ApiTags('Notifications')
@Controller('notifications')
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiResource({ type: ListNotificationsResponseDto, operationId: 'listNotifications', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.UNAUTHORIZED)
    async listNotifications(@CurrentSession('userId') userId: string) {
        return this.appService.listNotifications(userId);
    }

    @Patch(':notificationId/read')
    @ApiResource({ type: MarkNotificationReadResponseDto, operationId: 'markNotificationRead', status: HttpStatus.OK })
    @ApiResourceExceptions(HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED)
    async markNotificationRead(@CurrentSession('userId') userId: string, @Param('notificationId') notificationId: string) {
        return this.appService.markNotificationRead(userId, notificationId);
    }
}
