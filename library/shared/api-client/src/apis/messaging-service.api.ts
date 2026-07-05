import { Injectable } from '@nestjs/common';
import { createClient } from '../clients/messaging-service/client';
import { MessagingServiceSdk } from '../clients/messaging-service';
import { ApiClientOptions } from '../contract/api-client.contract';
import { ApiClientUtils } from '../utils/api-client.utils';

@Injectable()
export class MessagingServiceApi extends MessagingServiceSdk {
    constructor(options: ApiClientOptions) {
        super({
            client: createClient({
                baseUrl: options.baseUrl ?? ApiClientUtils.getServiceEndpoint('messaging-service'),
                throwOnError: true,
            }),
        });
    }
}
