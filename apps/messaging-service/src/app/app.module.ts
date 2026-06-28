import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConversationParticipantRepository, ConversationRepository, MessageRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, ConversationRepository, ConversationParticipantRepository, MessageRepository],
})
export class AppModule {}
