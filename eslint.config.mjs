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
                        {
                            sourceTag: 'scope:backend',
                            onlyDependOnLibsWithTags: ['scope:backend', 'scope:shared'],
                        },
                        // Frontend apps/libs (apps/frontend/web, apps/frontend/mobile, library/frontend/*) may depend on frontend or shared code, never backend.
                        {
                            sourceTag: 'scope:frontend',
                            onlyDependOnLibsWithTags: ['scope:frontend', 'scope:shared'],
                        },
                        // Shared contracts (library/shared/*) must stay leaf-level — no backend or frontend imports.
                        {
                            sourceTag: 'scope:shared',
                            onlyDependOnLibsWithTags: ['scope:shared'],
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
