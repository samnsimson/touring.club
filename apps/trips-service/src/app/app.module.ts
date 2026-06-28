import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripMembershipRepository, TripRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, TripRepository, TripMembershipRepository],
})
export class AppModule {}
