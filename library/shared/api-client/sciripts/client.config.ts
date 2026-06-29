import { createClient, type UserConfig } from '@hey-api/openapi-ts';

const SERVICES = ['auth-service', 'users-service', 'trips-service', 'messaging-service', 'notifications-service'] as const;

const buildServiceConfig = (service: string): UserConfig => ({
    input: { watch: false, path: `apps/backend/${service}/openapi/${service}.openapi.json` },
    output: { path: `library/shared/api-client/src/lib/${service}-client`, header: (ctx) => ['/* eslint-disable */', ...ctx.defaultValue] },
    plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
});

createClient(SERVICES.map(buildServiceConfig));
