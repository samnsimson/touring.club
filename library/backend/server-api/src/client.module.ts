import { DynamicModule, Module } from '@nestjs/common';
import { ServerApiModuleOptions } from './client.contract';
import { ServerApi } from './client.service';

@Module({})
export class ServerApiModule {
    static forRoot(options: ServerApiModuleOptions = {}): DynamicModule {
        const { global = true } = options;
        return {
            global,
            module: ServerApiModule,
            providers: [ServerApi],
            exports: [ServerApi],
        };
    }
}
