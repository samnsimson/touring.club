import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@tc/config';
import { HttpClient } from '../http';
import { EmailModuleOptions } from './email.contract';
import { EmailService } from './email.service';

@Module({})
export class EmailModule {
    static forRoot(options: EmailModuleOptions = {}): DynamicModule {
        const { global = true } = options;
        return {
            global,
            module: EmailModule,
            imports: [ConfigModule],
            providers: [
                {
                    provide: EmailService,
                    inject: [ConfigService, HttpClient],
                    useFactory: (config: ConfigService, http: HttpClient) => new EmailService(config, http),
                },
            ],
            exports: [EmailService],
        };
    }
}
