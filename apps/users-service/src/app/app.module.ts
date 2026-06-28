import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsClient } from './clients';
import { ProfileRepository, UserRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, TripsClient, ProfileRepository, UserRepository],
})
export class AppModule {}
