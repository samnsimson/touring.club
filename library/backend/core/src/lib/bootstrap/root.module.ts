import { DynamicModule, Type } from '@nestjs/common';
import { HttpModule, StorageModule } from '@tc/common';
import { ConfigModule } from '@tc/config';
import { DatabaseModule } from '@tc/database';

export class RootModule {
    static init(rootModule: Type<unknown>): DynamicModule {
        return {
            module: RootModule,
            imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule.forRootAsync(), HttpModule.forRoot(), StorageModule.forRoot(), rootModule],
            exports: [rootModule],
        };
    }
}
