import { DynamicModule, Type } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule, StorageModule } from '@tc/common';
import { ConfigModule } from '@tc/config';
import { DatabaseModule } from '@tc/database';
import { ApplicationBootstrapOptions } from './contract';

export type RootModuleOptions = Pick<ApplicationBootstrapOptions, 'globalAuthGuard'>;

export class RootModule {
    private static getAuthGuard(options: RootModuleOptions) {
        if (!options.globalAuthGuard) return [];
        return [{ provide: APP_GUARD, useClass: options.globalAuthGuard }];
    }

    static init(rootModule: Type<unknown>, options: RootModuleOptions): DynamicModule {
        return {
            module: RootModule,
            imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule.forRootAsync(), HttpModule.forRoot(), StorageModule.forRoot(), rootModule],
            providers: [...this.getAuthGuard(options)],
            exports: [rootModule],
        };
    }
}
