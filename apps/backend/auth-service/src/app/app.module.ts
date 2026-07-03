import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule, HybridAuthGuard } from '@tc/auth';

@Module({
    imports: [AuthModule.forRoot({ guard: HybridAuthGuard })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
