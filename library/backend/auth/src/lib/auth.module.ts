import { DynamicModule, MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
import { AuthModule as BetterAuthModule, AuthService } from '@thallesp/nestjs-better-auth';
import { HttpClient } from '@tc/common';
import { BetterAuthMiddleware } from './middleware/better-auth.middleware';
import { AuthModuleOptions } from './contracts/auth.contract';
import { createAuth } from './config/auth.config';
import { dataSource, env } from './config/auth.datasource';
import { EmailService } from './email';
import { AuthGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(BetterAuthMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
    }

    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        const guardProviders: Provider[] = options.guard ? [{ provide: APP_GUARD, useClass: options.guard }] : [];
        return {
            module: AuthModule,
            exports: [AuthService, AuthGuard, ...(options.exports ?? [])],
            providers: [AuthService, AuthGuard, BetterAuthMiddleware, ...guardProviders, ...(options.providers ?? [])],
            imports: [
                BetterAuthModule.forRootAsync({
                    disableGlobalAuthGuard: true,
                    inject: [HttpClient],
                    useFactory: async (http: HttpClient) => {
                        if (!dataSource.isInitialized) await dataSource.initialize();
                        return { auth: createAuth({ emailService: options.emailService ?? new EmailService(env, http) }) };
                    },
                }),
                ...(options.imports ?? []),
            ],
        };
    }
}
