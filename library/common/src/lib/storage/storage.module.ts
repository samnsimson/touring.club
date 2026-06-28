import { DynamicModule, Module } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigModule, ConfigService } from '@tc/config';
import { StorageService } from './storage.service';
import { STORAGE_S3_CLIENT } from './storage.tokens';
import { StorageModuleOptions } from './storage.contract';

@Module({})
export class StorageModule {
    static forRoot(options: StorageModuleOptions = {}): DynamicModule {
        const { global = true } = options;
        return {
            global,
            module: StorageModule,
            imports: [ConfigModule],
            providers: [
                {
                    provide: STORAGE_S3_CLIENT,
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) =>
                        new S3Client({
                            region: config.get('AWS_REGION'),
                            endpoint: config.get('AWS_S3_ENDPOINT'),
                            forcePathStyle: Boolean(config.get('AWS_S3_ENDPOINT')),
                            credentials:
                                config.get('AWS_ACCESS_KEY_ID') && config.get('AWS_SECRET_ACCESS_KEY')
                                    ? { accessKeyId: config.get('AWS_ACCESS_KEY_ID') as string, secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY') as string }
                                    : undefined,
                        }),
                },
                StorageService,
            ],
            exports: [StorageService],
        };
    }
}
