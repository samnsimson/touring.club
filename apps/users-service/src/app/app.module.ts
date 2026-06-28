import { Module } from '@nestjs/common';
import { AuthGuard } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileRepository, UserRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, ProfileRepository, UserRepository, AuthGuard],
})
export class AppModule {}
