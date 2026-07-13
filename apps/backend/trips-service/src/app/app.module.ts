import { Module } from '@nestjs/common';
import { AuthModule, HybridAuthGuard } from '@tc/auth';
import { ServerApiModule } from '@tc/server-api';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagingClient, NotificationsClient } from './clients';
import { TripMembershipRepository, TripRepository } from './repositories';

@Module({
    imports: [AuthModule.forRoot({ guard: HybridAuthGuard }), ServerApiModule.forRoot()],
    controllers: [AppController],
    providers: [AppService, MessagingClient, NotificationsClient, TripRepository, TripMembershipRepository],
})
export class AppModule {}
