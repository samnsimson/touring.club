import { Module } from '@nestjs/common';
import { AuthModule, HybridAuthGuard } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationRepository } from './repositories';
import { NotificationsGateway } from './gateways';

@Module({
    imports: [AuthModule.forRoot({ guard: HybridAuthGuard })],
    controllers: [AppController],
    providers: [AppService, NotificationRepository, NotificationsGateway],
})
export class AppModule {}
