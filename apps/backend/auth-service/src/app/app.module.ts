import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@tc/auth';

@Module({
    imports: [AuthModule.forRoot()],
    controllers: [AppController],
    providers: [AppService],
    exports: [AuthModule],
})
export class AppModule {}
