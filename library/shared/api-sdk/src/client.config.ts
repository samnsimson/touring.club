import { createClient } from '@hey-api/openapi-ts';
import { CLIENT_REGISTRY } from './client.registry';

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
            },
            {
                name: '@tanstack/react-query',
                queryOptions: true,
                mutationOptions: true,
                auth: true,
            },
        ],
        output: {
            postProcess: ['eslint', 'prettier'],
            path: `library/shared/api-sdk/src/clients/${service}`,
            header: (ctx) => ['/* eslint-disable @typescript-eslint/no-empty-interface */', ...ctx.defaultValue],
        },
    })),
);
