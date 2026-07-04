import { EmailModule, EmailService } from '@tc/common';
import { DynamicModule, MiddlewareConsumer, Module, NestModule, Provider, RequestMethod } from '@nestjs/common';
import { AuthModule as BetterAuthModule, AuthService } from '@thallesp/nestjs-better-auth';
import { BetterAuthMiddleware } from './middleware/better-auth.middleware';
import { AuthModuleOptions } from './contracts/auth.contract';
import { createAuth } from './config/auth.config';
import { dataSource } from './config/auth.datasource';
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
            exports: [AuthService],
            providers: [AuthService, BetterAuthMiddleware, ...guardProviders],
            imports: [
                EmailModule.forRoot(),
                BetterAuthModule.forRootAsync({
                    inject: [EmailService],
                    disableGlobalAuthGuard: true,
                    useFactory: async (emailService: EmailService) => {
                        if (!dataSource.isInitialized) await dataSource.initialize();
                        return { auth: createAuth({ emailService: options.emailService ?? emailService }) };
                    },
                }),
            ],
        };
    }
}
