import { ClientApi } from '@tc/client-api';

export const clientApi = new ClientApi({ baseUrl: `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1` });
