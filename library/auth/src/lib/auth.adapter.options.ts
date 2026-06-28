/** Shared options for `@hedystia/better-auth-typeorm` — used at runtime and by `auth:generate`. */
export const AUTH_TYPEORM_ADAPTER_OPTIONS = {
    outputDir: 'library/database/src',
    entitiesDir: 'library/database/src/entities/auth',
    usePlural: true,
    /** Entities only; use `bun run migration:generate` + `migration:run` for schema changes. */
    generateMigrations: false,
} as const;
