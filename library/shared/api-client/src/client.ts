import { ApiClientOptions } from './contract/api-client.contract';
import { createClient as createAuthClient } from './clients/auth-service/client';
import { AuthServiceSdk } from './clients/auth-service';
import { ApiClientUtils } from './utils/api-client.utils';

export class AuthServiceApi extends AuthServiceSdk {
    constructor(serviceName: string, options: ApiClientOptions) {
        super({
            client: createAuthClient({
                baseUrl: options.baseUrl ?? ApiClientUtils.getServiceEndpoint(serviceName),
                throwOnError: true,
            }),
        });
    }
}
