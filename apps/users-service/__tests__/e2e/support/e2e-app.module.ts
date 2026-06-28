import { Module, Type } from '@nestjs/common';
import { AuthModule } from '@tc/auth';
import type { MockEmailService } from '@tc/testing';
import { AppController as AuthController } from '../../../../auth-service/src/app/app.controller';
import { AppService as AuthAppService } from '../../../../auth-service/src/app/app.service';
import { AppController as ProfilesController } from '../../../src/app/app.controller';
import { AppService as ProfilesAppService } from '../../../src/app/app.service';
import { ProfileRepository, UserRepository } from '../../../src/app/repositories';

export function createUsersE2EAppModule(emailService: MockEmailService): Type<unknown> {
    @Module({
        imports: [AuthModule.forRoot({ emailService })],
        controllers: [AuthController, ProfilesController],
        providers: [AuthAppService, ProfilesAppService, ProfileRepository, UserRepository],
    })
    class UsersE2EAppModule {}

    return UsersE2EAppModule;
}
