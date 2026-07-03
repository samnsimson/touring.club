import { Module } from '@nestjs/common';
import { AuthModule } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationParticipantRepository, ConversationRepository, MessageRepository, TripMembershipRepository, TripRepository } from './repositories';
import { ConversationsGateway } from './gateways';
import { NotificationsClient } from './clients';

@Module({
    imports: [AuthModule.forRoot()],
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
    exports: [AuthModule],
})
export class AppModule {}
