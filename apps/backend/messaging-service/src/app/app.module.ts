import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationParticipantRepository, ConversationRepository, MessageRepository, TripMembershipRepository, TripRepository } from './repositories';
import { ConversationsGateway } from './gateways';
import { NotificationsClient } from './clients';

@Module({
    controllers: [AppController],
    providers: [
        AppService,
        ConversationRepository,
        ConversationParticipantRepository,
        MessageRepository,
        TripRepository,
        TripMembershipRepository,
        ConversationsGateway,
        NotificationsClient,
    ],
})
export class AppModule {}
