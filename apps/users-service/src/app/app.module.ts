import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '@tc/auth';
import { Profile } from '@tc/database';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfileRepository } from './repositories';

@Module({
    imports: [TypeOrmModule.forFeature([Profile])],
    controllers: [AppController],
    providers: [AppService, ProfileRepository, AuthGuard],
})
export class AppModule {}
