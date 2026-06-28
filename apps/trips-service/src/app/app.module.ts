import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TripRepository } from './repositories';

@Module({
    controllers: [AppController],
    providers: [AppService, TripRepository],
})
export class AppModule {}
