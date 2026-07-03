import { Module } from '@nestjs/common';
import { AuthModule } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagingClient, NotificationsClient } from './clients';
import { TripMembershipRepository, TripRepository } from './repositories';

@Module({
    imports: [AuthModule.forRoot()],
    controllers: [AppController],
    providers: [AppService, MessagingClient, NotificationsClient, TripRepository, TripMembershipRepository],
    exports: [AuthModule],
})
export class AppModule {}
