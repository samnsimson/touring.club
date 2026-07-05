import { createClient } from '@hey-api/openapi-ts';
import { ApiClientUtils } from './src/utils/api-client.utils';

const SERVICES = ['auth-service', 'users-service', 'trips-service', 'messaging-service', 'notifications-service'] as const;

createClient(
    SERVICES.map((service) => ({
        input: { path: `apps/backend/${service}/openapi/${service}.openapi.json` },
        plugins: [
            { name: '@hey-api/typescript' },
            {
                auth: true,
                name: '@hey-api/sdk',
                operations: {
                    strategy: 'single',
                    containerName: `${ApiClientUtils.pascalCase(service)}Api`,
                },
            },
        ],
        output: {
            postProcess: ['eslint', 'prettier'],
            path: `library/shared/api-client/src/lib/${service}`,
            header: (ctx) => ['/* eslint-disable @typescript-eslint/no-empty-interface */', ...ctx.defaultValue],
        },
    })),
);
