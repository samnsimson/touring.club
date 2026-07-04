/**
 * Cascading dotenv lookup, highest priority first. `@nestjs/config` (via `dotenv`) never
 * overrides a variable already present in `process.env`, so real env vars injected by the
 * shell/container/CI always win over every file below regardless of this order.
 */
export function resolveEnvFilePath(nodeEnv = process.env.NODE_ENV ?? 'development'): string[] {
    return [`.env.${nodeEnv}.local`, '.env.local', `.env.${nodeEnv}`, '.env'];
}
