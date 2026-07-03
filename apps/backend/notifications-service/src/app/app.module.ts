import { Module } from '@nestjs/common';
import { AuthModule } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationRepository } from './repositories';
import { NotificationsGateway } from './gateways';

@Module({
    imports: [AuthModule.forRoot()],
    controllers: [AppController],
    providers: [AppService, NotificationRepository, NotificationsGateway],
    exports: [AuthModule],
})
export class AppModule {}
