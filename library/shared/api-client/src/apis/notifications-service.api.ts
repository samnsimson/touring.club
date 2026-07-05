import { createClient } from '../clients/notifications-service/client';
import { NotificationsServiceSdk } from '../clients/notifications-service';
import { ApiClientOptions } from '../contract/api-client.contract';
import { ApiClientUtils } from '../utils/api-client.utils';

export class NotificationsServiceApi extends NotificationsServiceSdk {
    constructor(options: ApiClientOptions) {
        super({
            client: createClient({
                baseUrl: options.baseUrl ?? ApiClientUtils.getServiceEndpoint('notifications-service'),
                throwOnError: true,
            }),
        });
    }
}
