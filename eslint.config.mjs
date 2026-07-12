import nx from '@nx/eslint-plugin';

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        ignores: ['**/dist', '**/out-tsc'],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
                    depConstraints: [
                        // Backend services/libs (apps/backend/*, library/backend/*) may depend on backend or shared code, never frontend.
                        // @tc/api-sdk has no scope:backend/scope:shared tag so it's never a direct, allowed dependency here —
                        // backend code must go through @tc/server-api instead. @tc/client-api is explicitly off-limits too.
                        {
                            sourceTag: 'scope:backend',
                            onlyDependOnLibsWithTags: ['scope:backend', 'scope:shared'],
                            notDependOnLibsWithTags: ['type:client-api'],
                        },
                        // Frontend apps/libs (apps/frontend/web, apps/frontend/mobile, library/frontend/*) may depend on frontend or shared code, never backend.
                        // @tc/api-sdk is likewise unreachable directly — frontend code must go through @tc/client-api. @tc/server-api is off-limits too.
                        {
                            sourceTag: 'scope:frontend',
                            onlyDependOnLibsWithTags: ['scope:frontend', 'scope:shared'],
                            notDependOnLibsWithTags: ['type:server-api'],
                        },
                        // Shared contracts (library/shared/*) must stay leaf-level — no backend or frontend imports.
                        // @tc/api-sdk (type:api-sdk) is explicitly allow-listed here — it's the one thing scope:shared
                        // wrapper libs (@tc/server-api, @tc/client-api) are meant to depend on.
                        {
                            sourceTag: 'scope:shared',
                            onlyDependOnLibsWithTags: ['scope:shared', 'type:api-sdk'],
                        },
                        // @tc/api-sdk is a strict leaf: it holds only hey-api-generated code and must never depend on
                        // its own wrapper libraries (or anything else in the workspace) — no wrapper -> sdk -> wrapper cycles.
                        // It intentionally carries no scope:* tag, so it's absent from every scope:* allow-list above and
                        // can only ever be a *direct* dependency of scope:shared projects (i.e. @tc/server-api/@tc/client-api) —
                        // apps/libs elsewhere in the graph reach it exclusively through those two wrappers.
                        {
                            sourceTag: 'type:api-sdk',
                            onlyDependOnLibsWithTags: [],
                        },
                        // @tc/server-api (backend interservice calls, bypasses Kong) must never depend on @tc/client-api.
                        {
                            sourceTag: 'type:server-api',
                            notDependOnLibsWithTags: ['type:client-api'],
                        },
                        // @tc/client-api (frontend, routed through Kong) must never depend on @tc/server-api.
                        {
                            sourceTag: 'type:client-api',
                            notDependOnLibsWithTags: ['type:server-api'],
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['**/__tests__/e2e/**/*.ts'],
        rules: {
            '@nx/enforce-module-boundaries': 'off',
        },
    },
];
