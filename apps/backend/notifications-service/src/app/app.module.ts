import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationRepository } from './repositories';
import { NotificationsGateway } from './gateways';

@Module({
    controllers: [AppController],
    providers: [AppService, NotificationRepository, NotificationsGateway],
})
export class AppModule {}
