import { DynamicModule, Type } from '@nestjs/common';
import { DatabaseModule } from '@tc/database';
import { ConfigModule } from '@tc/config';

export class RootModule {
    static init(rootModule: Type<unknown>): DynamicModule {
        return {
            module: RootModule,
            imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule.forRootAsync(), rootModule],
            exports: [rootModule],
        };
    }
}
