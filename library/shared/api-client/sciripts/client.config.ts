import { createClient } from '@hey-api/openapi-ts';

createClient([
    {
        input: { watch: true, path: 'apps/backend/auth-service/openapi/auth-service.openapi.json' },
        output: { path: 'src/lib/auth-service-client' },
        plugins: [{ name: '@hey-api/typescript' }, { name: '@hey-api/sdk', auth: true, operations: { strategy: 'single' } }],
    },
]);
