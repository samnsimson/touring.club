import { createClient } from '@hey-api/openapi-ts';
import { ApiClientUtils } from './utils/api-client.utils';
import { CLIENT_REGISTRY } from './client.registry';

createClient(
    CLIENT_REGISTRY.map(({ name: service }) => ({
        input: { path: `apps/backend/${service}/openapi/${service}.openapi.json` },
        plugins: [
            { name: '@hey-api/typescript' },
            {
                auth: true,
                name: '@hey-api/sdk',
                operations: {
                    strategy: 'single',
                    containerName: `${ApiClientUtils.pascalCase(service)}Sdk`,
                },
            },
        ],
        output: {
            postProcess: ['eslint', 'prettier'],
            path: `library/shared/api-client/src/clients/${service}`,
            header: (ctx) => ['/* eslint-disable @typescript-eslint/no-empty-interface */', ...ctx.defaultValue],
        },
    })),
);
