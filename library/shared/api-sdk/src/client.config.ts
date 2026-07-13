import { createClient } from '@hey-api/openapi-ts';
import { CLIENT_REGISTRY } from './client.registry';
import { ApiSdkUtils } from './utils/api-sdk.utils';

createClient(
    CLIENT_REGISTRY.map((service) => ({
        input: { path: `apps/backend/${service}/openapi/${service}.openapi.json` },
        plugins: [
            {
                name: '@hey-api/typescript',
            },
            {
                auth: true,
                name: '@hey-api/sdk',
                operations: {
                    strategy: 'single',
                    containerName: `${ApiSdkUtils.pascalCase(service)}Sdk`,
                },
            },
            {
                auth: true,
                name: '@tanstack/react-query',
                queryOptions: true,
                mutationOptions: true,
            },
        ],
        output: {
            postProcess: ['eslint', 'prettier'],
            path: `library/shared/api-sdk/src/clients/${service}`,
            header: (ctx) => ['/* eslint-disable @typescript-eslint/no-empty-interface */', ...ctx.defaultValue],
        },
    })),
);
