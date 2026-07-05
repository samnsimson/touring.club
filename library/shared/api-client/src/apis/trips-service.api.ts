import { Injectable } from '@nestjs/common';
import { createClient } from '../clients/trips-service/client';
import { TripsServiceSdk } from '../clients/trips-service';
import { ApiClientOptions } from '../contract/api-client.contract';
import { ApiClientUtils } from '../utils/api-client.utils';

@Injectable()
export class TripsServiceApi extends TripsServiceSdk {
    constructor(options: ApiClientOptions) {
        super({
            client: createClient({
                baseUrl: options.baseUrl ?? ApiClientUtils.getServiceEndpoint('trips-service'),
                throwOnError: true,
            }),
        });
    }
}
