import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from './lib';
import { createClient } from './lib/client';
import { ApiClientUtils } from './utils/api-client.utils';

@Injectable()
export class ApiClientService extends ApiService {
    constructor(config: ConfigService) {
        super({
            client: createClient({
                baseUrl: ApiClientUtils.buildBaseUrl(config.getOrThrow('GATEWAY_BASE_URL')),
                throwOnError: true,
            }),
        });
    }
}
