import { DynamicModule, Module } from '@nestjs/common';
import { AuthModuleOptions } from './auth.contracts';
import { AuthModule as BetterAuthModule, AuthService } from '@thallesp/nestjs-better-auth';
import { auth } from './auth.config';

@Module({})
export class AuthModule {
    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        return {
            module: AuthModule,
            imports: [BetterAuthModule.forRoot({ auth }), ...(options.imports ?? [])],
            exports: [AuthService, ...(options.exports ?? [])],
            providers: [AuthService, ...(options.providers ?? [])],
        };
    }
}
