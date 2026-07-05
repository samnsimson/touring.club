import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiClientModuleOptions } from '../contract/api-client.contract';
import { AuthServiceApi } from '../apis/auth-service.api';

@Module({})
export class ApiClientModule {
    static forRoot({ global = true }: ApiClientModuleOptions = {}): DynamicModule {
        return {
            global,
            module: ApiClientModule,
            imports: [ConfigModule],
            providers: [AuthServiceApi],
            exports: [AuthServiceApi],
        };
    }
}
