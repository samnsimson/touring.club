import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { HttpClient } from './http.client';
import { HttpModuleOptions } from './http.contract';

@Module({})
export class HttpModule {
    static forRoot(options: HttpModuleOptions = {}): DynamicModule {
        const { global = true, ...axiosConfig } = options;
        return {
            global,
            module: HttpModule,
            imports: [NestHttpModule.register(axiosConfig as never)],
            providers: [HttpClient],
            exports: [HttpClient],
        };
    }
}
