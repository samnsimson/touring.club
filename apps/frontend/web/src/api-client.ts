import { ApiClientUtils, ApiService, createClient } from '@tc/api-client';

export const apiClient = new ApiService({
    client: createClient({ baseUrl: ApiClientUtils.buildBaseUrl(process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? ''), throwOnError: true }),
});
