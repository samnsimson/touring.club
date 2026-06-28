import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagingClient, NotificationsClient } from './clients';
import { TripMembershipRepository, TripRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, MessagingClient, NotificationsClient, TripRepository, TripMembershipRepository],
})
export class AppModule {}
