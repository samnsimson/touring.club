import { createClient } from '../clients/users-service/client';
import { UsersServiceSdk } from '../clients/users-service';
import { ApiClientOptions } from '../contract/api-client.contract';
import { ApiClientUtils } from '../utils/api-client.utils';

export class UsersServiceApi extends UsersServiceSdk {
    constructor(options: ApiClientOptions) {
        super({
            client: createClient({
                baseUrl: options.baseUrl ?? ApiClientUtils.getServiceEndpoint('users-service'),
                throwOnError: true,
            }),
        });
    }
}
