<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

# Touring Club Monorepo

This document gives agents the full context needed to work effectively in this repository. Read it before making changes.

## What This Project Is

**Touring Club** (`touring.club`) is a social travel and touring platform — discover, organize, and join group trips, experiences, and community-driven travel events. Read **[docs/PROJECT.md](docs/PROJECT.md)** for the full product vision, domain model, feature roadmap, user types, and target architecture.

**Current codebase:** Early-stage Nx monorepo focused on **authentication** — a dedicated `auth-service` backed by [Better Auth](https://www.better-auth.com/), TypeORM, and PostgreSQL. The architecture is designed to grow into additional services and client apps. Treat `docs/PROJECT.md` as the product north star; follow existing repo patterns unless explicitly migrating.

**Package manager:** Bun (`bun.lock`). Always prefix Nx commands with `bun` (e.g. `bun nx serve auth-service`).

## Tech Stack

| Layer                     | Technology                                   |
| ------------------------- | -------------------------------------------- |
| Monorepo                  | Nx 23                                        |
| Runtime / package manager | Bun                                          |
| Framework                 | NestJS 11 (Express)                          |
| Auth                      | Better Auth + `@thallesp/nestjs-better-auth` |
| ORM                       | TypeORM (PostgreSQL)                         |
| Env validation            | Zod (`@tc/config`)                           |
| Request validation        | class-validator + class-transformer          |
| API docs                  | `@nestjs/swagger`                            |
| Testing                   | Jest (apps/libs), Vitest (`auth` lib)        |
| Bundling                  | Webpack (apps), esbuild (libs)               |
| Linting                   | ESLint 9 (flat config)                       |
| Formatting                | Prettier + lint-staged (pre-commit)          |

Local infrastructure: `docker compose up` starts PostgreSQL 17 on port 5432 (`touring_club` database).

## Repository Layout

```
touring.club/
├── apps/                    # Deployable NestJS microservices
│   └── auth-service/        # Auth API (sign-up, sign-in, verify-email)
├── library/                 # Shared libraries consumed by apps
│   ├── auth/                # Better Auth config, module, guards, adapter
│   ├── config/              # Zod env schema, ConfigModule/ConfigService
│   ├── core/                # App bootstrap, Swagger, health routes
│   ├── database/            # TypeORM module, entities, migrations
│   ├── utils/               # Cross-cutting utilities and decorators
│   ├── testing/             # E2E helpers (E2EApi, EmailCapture, fixtures)
│   └── common/              # Shared types/constants (use sparingly)
├── .agents/skills/          # Workspace Nx skills (read before scaffolding/CI)
├── patches/                 # bun patch overrides (e.g. better-auth-typeorm)
├── docker-compose.yml
├── nx.json
├── tsconfig.base.json
└── package.json             # Root workspace: @touring.club/source
```

**Where to create new files:**

| Artifact                    | Location                               | Generator                                    |
| --------------------------- | -------------------------------------- | -------------------------------------------- |
| New microservice            | `apps/<service-name>/`                 | `nx-generate` skill → `@nx/nest:application` |
| New shared library          | `library/<lib-name>/`                  | `nx-generate` skill → `@nx/js:library`       |
| DTOs, controllers, services | `apps/<app>/src/app/`                  | Hand-written or Nest schematics              |
| App unit tests              | `apps/<app>/__tests__/`                | Hand-written Jest specs                      |
| App e2e tests               | `apps/<app>/__tests__/e2e/`            | `@tc/testing` + Jest e2e target              |
| App Jest config             | `apps/<app>/jest.config.cts`           | `createAppUnitJestConfig` from `jest/`       |
| App e2e Jest config         | `apps/<app>/jest.e2e.config.cts`       | `createAppE2eJestConfig` from `jest/`        |
| DB entities                 | `library/database/src/entities/`       | Better Auth generate or TypeORM migrations   |
| DB migrations               | `library/database/src/migrations/`     | `bun nx run database:migration:generate`     |
| Env variables               | `library/config/src/lib/env.schema.ts` | Hand-written                                 |
| Shared utilities            | `library/utils/src/lib/`               | Hand-written                                 |
| Auth plugins/config         | `library/auth/src/lib/`                | Hand-written                                 |

Do **not** put application code in `library/` or shared library code in `apps/`. Apps are thin orchestration layers; reusable logic belongs in libraries.

## Package Naming & Imports

| Scope                  | Example                      | Used for                         |
| ---------------------- | ---------------------------- | -------------------------------- |
| `@touring.club/source` | Root workspace               | Internal Nx resolution condition |
| `@touring.club/<app>`  | `@touring.club/auth-service` | App package names                |
| `@tc/<lib>`            | `@tc/auth`, `@tc/core`       | Shared library imports           |

Always import shared code via `@tc/*` package names — never relative paths across project boundaries. When adding a new workspace dependency, use the `link-workspace-packages` skill (Bun: `bun add @tc/foo --cwd apps/my-app`).

Libraries export through `src/index.ts`. Add new public APIs there; keep internals in `src/lib/`.

## Libraries — When to Use What

### `@tc/config`

- Zod `EnvSchema` and `validateEnv()` for all environment variables
- `ConfigModule` / `ConfigService` for typed config access
- **Add new env vars here first**, then reference via `ConfigService` or `validateEnv(process.env)`

### `@tc/core`

- `bootstrapApplication()` — standard NestJS boot (global prefix, versioning, validation pipe, cookies, Swagger, health routes)
- `RootModule` wires `ConfigModule` + `DatabaseModule` around each app's module
- **Every new service's `main.ts` should use `bootstrapApplication`**

### `@tc/database`

- `DatabaseModule.forRootAsync()` — global TypeORM setup (auto-loaded entities, snake_case naming)
- Entities in `src/entities/`, migrations in `src/migrations/`
- Auth-related entities are generated/managed by Better Auth adapter into `entities/auth/`
- Run migrations: `bun run migration:run` (root) or `bun nx run database:migration:run`

### `@tc/auth`

- Better Auth instance (`auth.config.ts`), `AuthModule.forRoot()`, guards, middleware
- Custom TypeORM adapter for Better Auth (with patched `@hedystia/better-auth-typeorm`)
- Generate auth schema: `bun run auth:generate` or `bun nx run auth:generate`
- **All auth domain logic lives here**, not duplicated in apps

### `@tc/utils`

- `DatabaseUtils` — DataSource factory with `SnakeNamingStrategy`
- `ApiResource` / `ApiResourceExceptions` — Swagger decorator helpers for controllers
- `usernameValidator` and other small pure utilities
- **Put reusable non-domain helpers here** (not in `common` unless truly generic)

### `@tc/common`

- Reserved for shared types/constants across services. Currently minimal — prefer a focused library over dumping into `common`.

### `@tc/testing`

- `E2EApi` — supertest wrapper with fixture loading, email capture, and response redaction
- `EmailCapture` — poll captured emails written by `EMAIL_PROVIDER=capture`
- `RequestFixtureLoader` — optional helper to load JSON request bodies from disk when useful
- `SnapshotRedactor` — redact dynamic fields before snapshot assertions
- **Use for app e2e suites** under `apps/<app>/__tests__/e2e/`
- **Formatting:** see `.cursor/rules/e2e-test-format.mdc`

## Dependency Direction

```
apps/*  →  @tc/core, @tc/auth, @tc/config, @tc/utils, …
@tc/core  →  @tc/config, @tc/database
@tc/database  →  @tc/config, @tc/utils
@tc/auth  →  @tc/config, @tc/utils
```

Libraries must not import from apps. Avoid circular deps between libraries. `@tc/config` and `@tc/utils` should stay at the bottom of the graph.

## Current Projects

| Project        | Type | Purpose                          |
| -------------- | ---- | -------------------------------- |
| `auth-service` | app  | Auth REST API (`/api/v1/auth/*`) |
| `auth`         | lib  | Better Auth integration          |
| `core`         | lib  | Bootstrap & Swagger              |
| `config`       | lib  | Environment & config             |
| `database`     | lib  | TypeORM & migrations             |
| `testing`      | lib  | Shared e2e testing utilities     |
| `utils`        | lib  | Shared utilities                 |
| `common`       | lib  | Shared types (minimal)           |

## Application Patterns

### Bootstrapping a service

```typescript
import { validateEnv } from '@tc/config';
import { bootstrapApplication } from '@tc/core';
import { createBetterAuthMiddleware } from '@tc/auth'; // if auth routes needed

async function bootstrap() {
    const env = validateEnv(process.env);
    await bootstrapApplication({
        globalPrefix: 'api',
        rootModule: AppModule,
        port: env.MY_SERVICE_PORT ?? 3000,
        swagger: { title: 'My Service', description: '...' },
        configure: async (app) => {
            // optional: middleware, extra setup
        },
    });
}
bootstrap();
```

### App Jest config

Shared factories live in `jest/`. New apps only need thin wrappers — no per-project SWC/Jest boilerplate. SWC config falls back to `jest/.spec.swcrc` when the app has no local `.spec.swcrc`.

```javascript
// apps/my-service/jest.config.cts
const { createAppUnitJestConfig } = require('../../jest/create-app-unit-config.cjs');
module.exports = createAppUnitJestConfig('my-service', __dirname);

// apps/my-service/jest.e2e.config.cts
const { createAppE2eJestConfig } = require('../../jest/create-app-e2e-config.cjs');
module.exports = createAppE2eJestConfig('my-service', __dirname);
```

Wire the e2e target in `project.json` to `jest.e2e.config.cts` and follow `__tests__/e2e/support/` conventions (see `.cursor/rules/e2e-test-format.mdc`).

### Controllers

- Use `@ApiTags()` on the controller class
- Use `@ApiResource()` and `@ApiResourceExceptions()` from `@tc/utils` on endpoints
- DTOs: class-validator decorators + `@ApiProperty()` for Swagger
- Place DTOs in `src/app/dto/`, export via `dto/index.ts`
- Use `@AllowAnonymous()` from `@thallesp/nestjs-better-auth` for public auth routes

### Modules

- App modules import domain modules (e.g. `AuthModule.forRoot()`) and declare controllers/providers
- `RootModule` (from `@tc/core`) already provides Config + Database globally

## Coding Standards

1. **TypeScript strict mode** — no `any` unless unavoidable; use definite assignment (`!`) on DTO fields
2. **ESM** — libraries use `"type": "module"`; respect existing import style
3. **NestJS conventions** — modules, controllers, services, DTOs; inject dependencies via constructor
4. **Minimize scope** — smallest correct diff; don't refactor unrelated code
5. **Match existing patterns** — read surrounding files before writing; reuse existing abstractions
6. **Comments** — only for non-obvious logic; code should be self-explanatory
7. **Tests** — add only when they cover meaningful behavior; Jest for apps, Vitest for `auth` lib adapter tests. **App tests live in `apps/<app>/__tests__/`** (unit specs at the root, e2e suites in `__tests__/e2e/`). Configure Jest `roots` to `__tests__` and ignore the e2e subdirectory from the unit `test` target. **E2e suite style:** follow `.cursor/rules/e2e-test-format.mdc` (reference: `apps/auth-service/__tests__/e2e/auth-password.e2e.spec.ts`) — one statement per line inside `it`, no blank lines within a test, inline request bodies.
8. **No secrets in code** — env vars via `@tc/config`; never commit `.env`
9. **Module boundaries** — ESLint `@nx/enforce-module-boundaries` is enabled; respect project tags

## Formatting Preferences

Prettier (`.prettierrc`) is the source of truth for formatted files:

- Single quotes
- Print width: 160
- Tab width: 4 spaces (no tabs)
- Trailing commas per Prettier defaults

Pre-commit hook runs `lint-staged`: ESLint --fix + Prettier on `*.{js,ts,tsx,mjs,...}`.

Root format script: `bun run format`.

## Common Commands

```bash
# Development
docker compose up -d                          # Start PostgreSQL
bun nx serve auth-service                     # Run auth service

# Build & test
bun nx run-many -t build                      # Build all
bun nx run-many -t test                       # Unit tests
bun nx run auth-service:e2e                   # Auth service e2e (requires Postgres)
bun nx affected -t lint test build            # Only changed projects

# Database
bun run migration:run                         # Apply migrations
bun run migration:generate                  # Generate migration (pass --name=...)

# Auth
bun run auth:generate                         # Regenerate Better Auth schema/entities

# Workspace
bun nx show projects                          # List projects
bun nx show project auth-service --json       # Project details + targets
bun nx graph                                  # Dependency graph
```

## Monorepo Best Practices

1. **Run tasks through Nx** — `bun nx run <project>:<target>`, not raw webpack/jest/tsc
2. **Use affected commands** for incremental work — `bun nx affected -t test`
3. **Build deps first** — lib `test` targets depend on `^build`; run `bun nx run-many -t build` if imports fail
4. **Link workspace packages properly** — use `link-workspace-packages` skill, not tsconfig path hacks
5. **Generate, don't hand-scaffold** — use `nx-generate` skill for new apps/libs
6. **Keep apps thin** — business logic in libraries; apps wire routes and service-specific config
7. **One env schema** — extend `EnvSchema` in `@tc/config` for new services/ports
8. **Migrations are committed** — never rely on `synchronize: true` in production

## Skills — When to Use

| Skill                     | Use when                                                       |
| ------------------------- | -------------------------------------------------------------- |
| `nx-workspace`            | Exploring projects, targets, dependencies, debugging Nx errors |
| `nx-generate`             | Creating apps, libs, or any scaffolding                        |
| `nx-run-tasks`            | Running build/test/lint/serve targets                          |
| `link-workspace-packages` | Adding `@tc/*` deps, fixing "cannot find module"               |
| `monitor-ci`              | User asks to watch/monitor CI                                  |
| `nx-plugins`              | Adding Nx plugin support                                       |

Workspace skills live in `.agents/skills/`. Read the relevant skill file before acting — don't improvise Nx commands when a skill exists.

## Planning & Execution

When given a task:

1. **Clarify scope** — is this a new service, library feature, bug fix, or infra change?
2. **Identify affected projects** — `bun nx show projects`, check dependency graph
3. **Pick the right library** — use the "When to Use What" table above
4. **Read existing code** in that area before writing
5. **Scaffold if needed** — `nx-generate` skill for new projects
6. **Wire dependencies** — `link-workspace-packages` skill
7. **Implement minimally** — match patterns in `auth-service` and sibling libs
8. **Verify** — `bun nx affected -t lint test build` on touched projects
9. **Don't commit unless asked** — user controls git operations

For auth-related work, always check `library/auth/src/lib/auth.config.ts` and the Better Auth plugin setup before changing behavior. For DB changes, use migrations — not manual entity edits without generating a migration.

## Patches & Special Notes

- `@hedystia/better-auth-typeorm@1.0.1` is patched via `patches/` (bun `patchedDependencies`)
- Auth entities output to `library/database/src/entities/auth/`
- `auth` lib tests use Vitest; most other projects use Jest
- API routes are versioned: `/api/v1/...` (configured in `bootstrapApplication`)
