import { Module } from '@nestjs/common';
import { AuthGuard } from '@tc/auth';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, ProfileRepository, AuthGuard],
})
export class AppModule {}
