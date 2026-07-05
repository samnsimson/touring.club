import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiClientModuleOptions } from '../contract/api-client.contract';
import { ApiClientService } from './api-client.service';

@Module({})
export class ApiClientModule {
    static forRoot({ global = true }: ApiClientModuleOptions = {}): DynamicModule {
        return {
            global,
            module: ApiClientModule,
            imports: [ConfigModule],
            providers: [ApiClientService],
            exports: [ApiClientService],
        };
    }
}
