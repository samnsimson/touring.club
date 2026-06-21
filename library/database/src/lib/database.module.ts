import { DynamicModule, Module } from '@nestjs/common';
import { DatabaseModuleOptions } from './database.contract';

@Module({})
export class DatabaseModule {
    static forRootAsync(options: DatabaseModuleOptions): DynamicModule {
        return {
            global: true,
            module: DatabaseModule,
            imports: [...options.imports],
            providers: [...options.providers],
            exports: [...options.exports],
        };
    }
}
