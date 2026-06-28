import { DynamicModule, Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@tc/common';
import { ConfigModule } from '@tc/config';
import { AuthGuard } from '@tc/auth';
import { DatabaseModule } from '@tc/database';

export interface RootModuleOptions {
    /** When false, skips registering the global AuthGuard (for e2e harnesses that supply their own guard). */
    globalAuth?: boolean;
}

export class RootModule {
    static init(rootModule: Type<unknown>, options: RootModuleOptions = {}): DynamicModule {
        const globalAuth = options.globalAuth ?? true;

        return {
            module: RootModule,
            imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule.forRootAsync(), HttpModule.forRoot(), rootModule],
            providers: [...(globalAuth ? [{ provide: APP_GUARD, useClass: AuthGuard }] : [])],
            exports: [rootModule],
        };
    }
}
