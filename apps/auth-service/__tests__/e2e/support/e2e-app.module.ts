import { Module, Type } from '@nestjs/common';
import { AuthModule } from '@tc/auth';
import type { MockEmailService } from '@tc/testing';
import { AppController } from '../../../src/app/app.controller';
import { AppService } from '../../../src/app/app.service';

export function createAuthE2EAppModule(emailService: MockEmailService): Type<unknown> {
    @Module({
        imports: [AuthModule.forRoot({ emailService })],
        controllers: [AppController],
        providers: [AppService],
    })
    class AuthE2EAppModule {}

    return AuthE2EAppModule;
}
