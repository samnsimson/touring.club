import { createClient } from '@hey-api/openapi-ts';

const SERVICES = ['auth-service', 'users-service', 'trips-service', 'messaging-service', 'notifications-service'] as const;

createClient({
    input: SERVICES.map((service) => ({ watch: false, path: `apps/backend/${service}/openapi/${service}.openapi.json` })),
    plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single', containerName: 'ApiService' } }],
    output: {
        postProcess: ['eslint', 'prettier'],
        path: `library/shared/api-client/src/lib`,
        header: (ctx) => ['/* eslint-disable @typescript-eslint/no-empty-interface */', ...ctx.defaultValue],
    },
});
