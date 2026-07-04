import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiService } from './lib';
import { createClient } from './lib/client';

@Injectable()
export class ApiClientService {
    public readonly auth: ApiService;
    public readonly user: ApiService;
    public readonly trips: ApiService;
    public readonly messaging: ApiService;
    public readonly notification: ApiService;

    constructor(private readonly config: ConfigService) {
        this.auth = new ApiService({ client: createClient({ baseUrl: this.config.get('AUTH_SERVICE_URL') }) });
        this.user = new ApiService({ client: createClient({ baseUrl: this.config.get('USER_SERVICE_URL') }) });
        this.trips = new ApiService({ client: createClient({ baseUrl: this.config.get('TRIPS_SERVICE_URL') }) });
        this.messaging = new ApiService({ client: createClient({ baseUrl: this.config.get('MESSAGING_SERVICE_URL') }) });
        this.notification = new ApiService({ client: createClient({ baseUrl: this.config.get('NOTIFICATION_SERVICE_URL') }) });
    }
}
