import { DynamicModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthModule as BetterAuthModule, AuthService } from '@thallesp/nestjs-better-auth';
import { BetterAuthMiddleware } from './middleware/better-auth.middleware';
import { AuthModuleOptions } from './auth.contracts';
import { createAuth } from './auth.config';
import { dataSource } from './auth.datasource';
import { AuthGuard } from './guard/auth.guard';

@Module({})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(BetterAuthMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
    }

    static forRoot(options: AuthModuleOptions = {}): DynamicModule {
        return {
            module: AuthModule,
            exports: [AuthService, AuthGuard, ...(options.exports ?? [])],
            providers: [AuthService, AuthGuard, BetterAuthMiddleware, ...(options.providers ?? [])],
            imports: [
                BetterAuthModule.forRootAsync({
                    useFactory: async () => {
                        if (!dataSource.isInitialized) await dataSource.initialize();
                        return { auth: createAuth({ emailService: options.emailService }) };
                    },
                }),
                ...(options.imports ?? []),
            ],
        };
    }
}
