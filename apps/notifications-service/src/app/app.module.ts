import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, NotificationRepository],
})
export class AppModule {}
