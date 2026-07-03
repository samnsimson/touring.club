import { ApiClient } from '@tc/api-client';

export const apiClient = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL });
