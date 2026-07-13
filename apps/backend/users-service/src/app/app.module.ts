import { Module } from '@nestjs/common';
import { AuthModule, HybridAuthGuard } from '@tc/auth';
import { ServerApiModule } from '@tc/server-api';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripsClient } from './clients';
import { ProfileRepository, UserRepository } from './repositories';

@Module({
    imports: [AuthModule.forRoot({ guard: HybridAuthGuard }), ServerApiModule.forRoot()],
    controllers: [AppController],
    providers: [AppService, TripsClient, ProfileRepository, UserRepository],
})
export class AppModule {}
