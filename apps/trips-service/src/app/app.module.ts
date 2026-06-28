import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagingClient } from './clients';
import { TripMembershipRepository, TripRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, MessagingClient, TripRepository, TripMembershipRepository],
})
export class AppModule {}
