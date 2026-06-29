import { createClient } from '@hey-api/openapi-ts';

createClient([
    {
        input: { watch: false, path: 'apps/backend/auth-service/openapi/auth-service.openapi.json' },
        output: { path: 'library/shared/api-client/src/lib/auth-service-client', header: (ctx) => ['/* eslint-disable */', ...ctx.defaultValue] },
        plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
    },
    {
        input: { watch: false, path: 'apps/backend/users-service/openapi/users-service.openapi.json' },
        output: { path: 'library/shared/api-client/src/lib/users-service-client', header: (ctx) => ['/* eslint-disable */', ...ctx.defaultValue] },
        plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
    },
    {
        input: { watch: false, path: 'apps/backend/trips-service/openapi/trips-service.openapi.json' },
        output: { path: 'library/shared/api-client/src/lib/trips-service-client', header: (ctx) => ['/* eslint-disable */', ...ctx.defaultValue] },
        plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
    },
    {
        input: { watch: false, path: 'apps/backend/messaging-service/openapi/messaging-service.openapi.json' },
        output: { path: 'library/shared/api-client/src/lib/messaging-service-client', header: (ctx) => ['/* eslint-disable */', ...ctx.defaultValue] },
        plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
    },
    {
        input: { watch: false, path: 'apps/backend/notifications-service/openapi/notifications-service.openapi.json' },
        output: { path: 'library/shared/api-client/src/lib/notifications-service-client', header: (ctx) => ['/* eslint-disable */', ...ctx.defaultValue] },
        plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
    },
]);
