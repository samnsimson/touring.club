import { Module } from '@nestjs/common';
import { AuthModule, HybridAuthGuard } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsClient } from './clients';
import { ProfileRepository, UserRepository } from './repositories';

@Module({
    imports: [AuthModule.forRoot({ guard: HybridAuthGuard })],
    controllers: [AppController],
    providers: [AppService, TripsClient, ProfileRepository, UserRepository],
})
export class AppModule {}
