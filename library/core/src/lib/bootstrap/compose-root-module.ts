import { Module, Type } from '@nestjs/common';
import { DatabaseModule } from '@tc/database';
import { ConfigModule } from '@tc/config';

export function composeRootModule(rootModule: Type<unknown>): Type<unknown> {
    @Module({ imports: [ConfigModule.forRoot(), DatabaseModule.forRootAsync(), rootModule] })
    class CompositeRootModule {}
    return CompositeRootModule;
}
