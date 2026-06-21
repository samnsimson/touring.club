import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { CONFIG_ENV, ConfigModuleOptions } from './config.contract';
import { ConfigService } from './config.service';
import { Env, envKeys } from './env.schema';
import { validateEnv } from './validate-env';

@Module({})
export class ConfigModule {
    static forRoot(options: ConfigModuleOptions = {}): DynamicModule {
        return {
            module: ConfigModule,
            global: options.isGlobal ?? true,
            imports: [
                NestConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: options.envFilePath,
                    expandVariables: true,
                    load: options.load,
                    validate: validateEnv,
                }),
            ],
            providers: [
                {
                    provide: CONFIG_ENV,
                    inject: [NestConfigService],
                    useFactory: (nestConfig: NestConfigService): Env => {
                        const raw = Object.fromEntries(envKeys.map((key) => [key, nestConfig.get<string>(key)]));
                        return Object.freeze(validateEnv(raw));
                    },
                },
                ConfigService,
            ],
            exports: [ConfigService],
        };
    }

    static forRootAsync(options: ConfigModuleOptions): DynamicModule {
        return ConfigModule.forRoot(options);
    }
}
