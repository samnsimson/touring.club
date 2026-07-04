import { ApiClientConfig } from '../contract/client.contract';

export const baseClientConfig = (options: ApiClientConfig) => ({
    baseUrl: options.baseUrl,
    throwOnError: true,
});
