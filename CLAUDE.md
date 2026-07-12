<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

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

**Current codebase:** Early-stage Nx monorepo with a **microservices architecture** — one NestJS service per domain. Today only `auth-service` is implemented. Shared infrastructure lives in `library/` (`@tc/*`). Treat `docs/PROJECT.md` as the product north star; follow existing repo patterns unless explicitly migrating.

**Testing scope (pre-go-live):** Only unit tests are maintained right now. E2e suites, `@tc/testing`, and all e2e tooling were intentionally removed — do not add new e2e tests, configs, or an e2e library until the team explicitly resumes that work closer to go-live.

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

## Architecture

**Microservices — one service per domain.** Each domain (auth, users, trips, messaging, notifications) is a deployable NestJS app under `apps/backend/<domain>-service/`. Services are independently deployable and scalable.

**Libraries are shared infrastructure only.** `library/` holds cross-cutting code consumed by all services: config, bootstrap, database, Better Auth integration, utilities, and test helpers. Do **not** create domain libraries (e.g. `library/backend/users`, `library/backend/trips`) — domain logic belongs in the owning microservice.

| Layer        | Location                         | Contains                                                             |
| ------------ | -------------------------------- | -------------------------------------------------------------------- |
| Microservice | `apps/backend/<domain>-service/` | Controllers, DTOs, domain services, module wiring for one domain     |
| Shared lib   | `library/backend/<name>/`        | Config, core bootstrap, TypeORM, auth guards, utils, testing helpers |

Reference implementation: `apps/backend/auth-service/` + `@tc/auth` (shared Better Auth integration, not a substitute for the auth microservice).

## Repository Layout

```
touring.club/
├── apps/
│   ├── backend/             # Deployable NestJS microservices (one per domain)
│   │   ├── auth-service/        # Auth API — sign-up, sign-in, verify-email, sessions
│   │   ├── users-service/       # User profiles — GET/PATCH me, travel history, public profile
│   │   ├── trips-service/       # Trips — create, discovery, membership
│   │   ├── messaging-service/   # Direct and trip group chat — conversations and messages
│   │   └── notifications-service/ # In-app notifications — list and mark read
│   └── frontend/            # Client apps (one per platform)
│       └── web/                 # Next.js web frontend (App Router) — Chakra UI shell, mock-data browsing, /login wired to auth-service
├── library/
│   └── backend/             # Shared infrastructure consumed by all backend services
│       ├── auth/                # Better Auth config, guards, adapter (shared auth infra)
│       ├── config/              # Zod env schema, ConfigModule/ConfigService
│       ├── core/                # App bootstrap, Swagger, health routes
│       ├── database/            # TypeORM module, entities, migrations
│       ├── utils/                # Cross-cutting utilities and decorators
│       ├── common/               # HTTP client (axios) and S3 object storage (StorageModule/StorageService)
│       └── server-api/           # Wraps @tc/api-sdk for backend interservice calls, bypassing Kong (see below)
│   └── shared/               # Shared infrastructure consumed by both backend and frontend projects
│       └── api-sdk/              # Generated hey-api SDK (types, fetch client, functions, react-query hooks) per backend service — never imported by apps directly (see below)
│   └── frontend/            # Shared infrastructure consumed by frontend projects
│       └── client-api/           # Wraps @tc/api-sdk for frontend calls routed through Kong (see below)
├── .agents/skills/          # Workspace Nx skills (read before scaffolding/CI)
├── patches/                 # bun patch overrides (e.g. better-auth-typeorm)
├── docker-compose.yml
├── nx.json
├── tsconfig.base.json
└── package.json             # Root workspace: @touring.club/source
```

`apps/backend/` and `library/backend/` are nested one level deeper than a typical Nx layout on purpose — each platform gets its own grouping folder (`apps/backend/<domain>-service/`, `apps/frontend/<client-app>/`) so the backend/frontend/shared boundary is visible in the folder tree itself, not just enforced by lint config. `apps/frontend/web/` now holds a real Nx-generated Next.js app (`@nx/next:app`, App Router, tag `scope:frontend`) with a Chakra UI shell (`@tc/ui`), mock-data-driven browsing pages (`@tc/mocks`), and a `/login` page authenticating against real `auth-service` via `@tc/client-api`; most other product features are still mock-backed or not yet built. `apps/frontend/mobile/` (React Native) is reserved for a future client — new frontend apps go under `apps/frontend/<app-name>/`, mirroring how new domains go under `apps/backend/<domain>-service/`. `library/shared/` holds `api-sdk` (tag `type:api-sdk`, no `scope:*` tag — see **Module boundaries** below); `library/backend/` has `server-api` and `library/frontend/` has `client-api` (both tagged `scope:shared`) — see **Shared API SDK & wrapper libraries** below.

**Where to create new files:**

| Artifact                                            | Location                                                                   | Generator                                                                                                                                  |
| --------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| New domain microservice                             | `apps/backend/<domain>-service/`                                           | See **Scaffold microservice** below                                                                                                        |
| New frontend client app                             | `apps/frontend/<app-name>/`                                                | See **Scaffold frontend app** below                                                                                                        |
| New shared library                                  | `library/backend/<lib-name>/`                                              | `nx-generate` skill → `@nx/js:library`                                                                                                     |
| DTOs, controllers, services                         | `apps/backend/<service>/src/app/`                                          | Hand-written — domain logic stays in the service                                                                                           |
| App unit tests                                      | `apps/backend/<service>/__tests__/unit/`                                   | Hand-written Jest specs                                                                                                                    |
| Lib unit tests                                      | `library/backend/<lib>/__tests__/unit/`                                    | Hand-written Jest specs (Vitest for `auth` lib)                                                                                            |
| App Jest config                                     | `apps/backend/<service>/jest.config.cts`                                   | `createAppUnitJestConfig` from `jest/`                                                                                                     |
| Lib Jest config                                     | `library/backend/<lib>/jest.config.cts`                                    | `createLibJestConfig` from `jest/`                                                                                                         |
| Auth DB entities                                    | `library/backend/database/src/entities/auth/`                              | Better Auth generate (`auth:generate`)                                                                                                     |
| Other DB entities                                   | `library/backend/database/src/entities/general/`                           | Hand-written + TypeORM migrations                                                                                                          |
| Service repositories                                | `apps/backend/<service>/src/app/repositories/`                             | Extend `BaseRepository` from `@tc/database`                                                                                                |
| DB migrations                                       | `library/backend/database/src/migrations/`                                 | `bun nx run database:migration:generate`                                                                                                   |
| DB CLI scripts                                      | `library/backend/database/scripts/`                                        | `database.datasource.ts`, bundled `run-migrations-entry.ts` → `dist/scripts/run-migrations.cjs`                                            |
| Env variables                                       | `library/backend/config/src/lib/env.schema.ts`                             | Hand-written                                                                                                                               |
| Shared utilities                                    | `library/backend/utils/src/lib/`                                           | Hand-written                                                                                                                               |
| Auth integration (shared)                           | `library/backend/auth/src/lib/`                                            | Hand-written                                                                                                                               |
| Auth CLI scripts                                    | `library/backend/auth/scripts/`                                            | `auth.cli.config.ts` for `auth:generate`                                                                                                   |
| OpenAPI CLI config                                  | `apps/backend/<service>/openapi.config.ts`                                 | `openapi:generate` target (`@tc/core` `generateOpenApiDocument`)                                                                           |
| Generated OpenAPI specs                             | `apps/backend/<service>/openapi/<service>.openapi.json` (gitignored)       | `bun run openapi:generate` / `bun nx run <service>:openapi:generate`                                                                       |
| Generated per-service SDK (hey-api)                 | `library/shared/api-sdk/src/clients/<service>/` (committed)                | `bun nx run api-sdk:sdk:generate` (see **Shared API SDK & wrapper libraries** below)                                                       |
| Generated `<Service>Api` server wrappers            | `library/backend/server-api/src/apis/<service>.server-api.ts` (committed)  | `bun nx run server-api:api:generate`                                                                                                       |
| Generated frontend service clients                  | `library/frontend/client-api/src/apis/<service>.client-api.ts` (committed) | `bun nx run client-api:api:generate`                                                                                                       |
| `api-sdk`/`server-api`/`client-api` codegen scripts | `library/<shared\|backend\|frontend>/<lib>/scripts/`                       | `client.config.ts` (hey-api codegen, in `api-sdk/src/`) + `generate-server-apis.ts`/`generate-client-apis.ts` (Handlebars template render) |

Do **not** put domain business logic in `library/` or microservice-specific code that belongs in another service's app. Libraries hold **shared infrastructure**; each microservice owns its domain controllers, services, and DTOs. **CLI/tooling entrypoints** (migrations runner, TypeORM data source, Better Auth generate config, api-sdk/server-api/client-api codegen) live under `library/<backend|frontend|shared>/<lib>/scripts/` — not in `src/`.

### Scaffold microservice (required command)

When scaffolding a **new domain microservice** under `apps/backend/`, invoke the `nx-generate` skill and always use this command shape. Prefix with `bun` (this workspace's package manager). Substitute `<domain>-service` for the service name (e.g. `users-service`, `trips-service`):

```bash
bun nx generate @nx/nest:application \
  --directory=apps/backend/<domain>-service \
  --linter=eslint \
  --name=<domain>-service \
  --tags=<domain>-service,scope:backend \
  --unitTestRunner=jest \
  --useProjectJson=true \
  --no-interactive
```

Example (users domain):

```bash
bun nx generate @nx/nest:application --directory=apps/backend/users-service --linter=eslint --name=users-service --tags=users-service,scope:backend --unitTestRunner=jest --useProjectJson=true --no-interactive
```

The `scope:backend` tag is required — `@nx/enforce-module-boundaries` in the root `eslint.config.mjs` restricts `scope:backend` projects to only depend on other `scope:backend` projects (see "Module boundaries" below).

Do **not** improvise different flags for `@nx/nest:application` unless the user explicitly asks. After generation, wire workspace deps via `link-workspace-packages`, add env vars to `@tc/config`, follow `auth-service` / `users-service` patterns (Jest config from `jest/`, repositories under `src/app/repositories/`), and run `docs-sync` to update markdown. Do not scaffold `__tests__/e2e/` or an e2e Jest config — e2e is out of scope pre-go-live (see "Testing scope" above).

### Scaffold frontend app (required command)

When scaffolding a **new frontend client app**, place it under `apps/frontend/<app-name>/` — mirrors how each backend domain gets its own folder under `apps/backend/<domain>-service/`. Invoke the `nx-generate` skill and prefix with `bun`. For a Next.js web client:

```bash
bun nx generate @nx/next:application \
  --directory=apps/frontend/<app-name> \
  --linter=eslint \
  --name=<app-name> \
  --unitTestRunner=jest \
  --e2eTestRunner=none \
  --tags=<app-name>,scope:frontend \
  --useProjectJson=true \
  --no-interactive
```

Example (web):

```bash
bun nx generate @nx/next:application --directory=apps/frontend/web --linter=eslint --name=web --unitTestRunner=jest --e2eTestRunner=none --tags=web,scope:frontend --useProjectJson=true --no-interactive
```

The `scope:frontend` tag is required — `@nx/enforce-module-boundaries` restricts `scope:frontend` projects to only depend on `scope:frontend`/`scope:shared` code, never backend (see "Module boundaries" below). Always set `--e2eTestRunner=none` — e2e is out of scope pre-go-live. A future React Native client (`apps/frontend/mobile/`) would use the equivalent React Native generator instead of `@nx/next:application`. `@nx/next` and `@nx/react` must be installed as devDependencies before the first Next.js app is generated (`@nx/react` provides the jest transform the generated `jest.config.cts` depends on).

## Package Naming & Imports

| Scope                  | Example                      | Used for                         |
| ---------------------- | ---------------------------- | -------------------------------- |
| `@touring.club/source` | Root workspace               | Internal Nx resolution condition |
| `@touring.club/<app>`  | `@touring.club/auth-service` | App package names                |
| `@tc/<lib>`            | `@tc/auth`, `@tc/core`       | Shared library imports           |

Always import shared code via `@tc/*` package names — never relative paths across project boundaries. When adding a new workspace dependency, use the `link-workspace-packages` skill (Bun: `bun add @tc/foo --cwd apps/backend/my-app`).

Libraries export through `src/index.ts`. Add new public APIs there; keep internals in `src/lib/`.

## Libraries — When to Use What

### `@tc/config`

- Zod `EnvSchema` and `validateEnv()` for all environment variables
- `ConfigModule` / `ConfigService` for typed config access
- **Add new env vars here first**, then reference via `ConfigService` or `validateEnv(process.env)`
- `resolveEnvFilePath()` — `ConfigModule.forRoot()` uses this by default (unless `envFilePath` is explicitly passed) to compute a cascading dotenv lookup based on `NODE_ENV`: `.env.<NODE_ENV>.local` → `.env.local` → `.env.<NODE_ENV>` → `.env`. A variable already present in the real process environment (shell, container, CI) always wins over every file in that list. Only `.env.example` / `.env.*.example` templates are committed — every real `.env*` file is gitignored; copy the matching example and fill in real values. Bun's CLI also auto-loads these same files with its own precedence when running via `bun nx serve`/`bun run` — this cascade is what makes the compiled output (`node dist/main.js`, e.g. in a future container) behave the same way

### `@tc/core`

- `bootstrapApplication()` — standard NestJS boot (global prefix, versioning, validation pipe, cookies, Swagger, health routes)
- `RootModule` wires `ConfigModule` + `DatabaseModule` around each app's module
- **Every new service's `main.ts` should use `bootstrapApplication`**
- `@tc/core` has no concept of a global auth guard — that's wired entirely through `@tc/auth`'s `AuthModule.forRoot({ guard: HybridAuthGuard })` (see `@tc/auth` below), since `AuthModule` is the module that actually provides `AuthService` and can resolve it for the guard. `@tc/core` still does not depend on `@tc/auth`

### `@tc/database`

- `DatabaseModule.forRootAsync()` — global TypeORM setup (auto-loaded entities, snake_case naming)
- `BaseRepository<Entity>` — abstract TypeORM `Repository` wrapper for NestJS DI; **extend in each service**, do not put domain repositories in `library/`
- Entities in `src/entities/`, migrations in `src/migrations/`
- **Auth entities** — PostgreSQL schema `auth`, path `entities/auth/`; regenerated via `auth:generate` (entities only — no migration files)
- **All other domain entities** — PostgreSQL schema `general`, path `entities/general/` (profiles, trips, messages, etc.)
- Use `@Entity({ schema: 'general', name: 'table_name' })` for non-auth entities
- **All schema migrations** (auth and general) — TypeORM only: `bun run migration:generate --name=...` then `bun run migration:run`
- Re-exported types (`DataSource`, `EntityTarget`, `ObjectLiteral`) — import from `@tc/database`; **do not add a direct `typeorm` dependency to apps** (avoids version conflicts)

#### Repository pattern (required for DB access in services)

Each microservice defines its own repositories under `apps/backend/<service>/src/app/repositories/`. Reference: `apps/backend/users-service/src/app/repositories/profile.repository.ts`.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository, Profile, type DataSource } from '@tc/database';

@Injectable()
export class ProfileRepository extends BaseRepository<Profile> {
    constructor(@InjectDataSource() dataSource: DataSource) {
        super(Profile, dataSource);
    }
    // domain query methods here
}
```

- Register each repository in the service module `providers`
- Inject the repository into services — not `@InjectRepository()` directly
- Put entity-specific queries on the repository, not scattered in services

### `@tc/auth`

- Shared **auth infrastructure** consumed by all microservices — Better Auth instance (`auth.config.ts`), `AuthModule.forRoot()`, guards, middleware
- `AuthModule.forRoot({ guard: HybridAuthGuard })` — pass a guard class (`HybridAuthGuard`, `KongAuthGuard`, or `StandaloneAuthGuard`) to register it globally via `APP_GUARD`, **inside `AuthModule` itself** (not `@tc/core`/`RootModule`) since `AuthModule` is what provides `AuthService`, which these guards need injected. All 5 services currently pass `HybridAuthGuard`. Per-route exemptions go through `@Public()` from `@tc/auth`, not by omitting the guard
- Custom TypeORM adapter for Better Auth (with patched `@hedystia/better-auth-typeorm`)
- Adapter options in `auth.adapter.options.ts` — `generateMigrations: false` so `auth:generate` writes **entity files only**
- After Better Auth plugin/config changes: `bun run auth:generate` → review entities → `bun run migration:generate --name=...` → `bun run migration:run`
- **Not a domain service** — the auth microservice is `apps/backend/auth-service/`; `@tc/auth` provides integration other services import for token validation and guards
- Guards injecting `AuthService<Auth>` (a generic type) must use an explicit `@Inject(AuthService)` on that constructor param — `@tc/auth` is built with esbuild, whose decorator-metadata emission doesn't reliably resolve generic type arguments, so without `@Inject()` NestJS silently injects `undefined` and any call to `authService.api` throws at request time instead of at boot

#### Internal service-to-service calls (required pattern)

When one microservice calls another directly (not through the gateway) on behalf of the current request — e.g. `trips-service` calling `messaging-service`/`notifications-service`, or `users-service` calling `trips-service` — construct the target service's `<Service>Api` from `@tc/server-api` directly, not `@tc/common`'s `HttpClient`, and never import `@tc/api-sdk` directly (module boundaries block it — see **Module boundaries** below). Point it at the target service's own `*_SERVICE_URL`, appending `/api/v1` since the generated SDK paths don't include the global prefix (`app.setGlobalPrefix('api')` + URI versioning add it at runtime, but `generateOpenApiDocument` emits paths without it), and forward the caller's `Authorization` header instead of inventing a separate service credential. Thread it from controller → service → client:

```typescript
// controller
async approveMembership(@CurrentSession('userId') userId: string, @Param('tripId') tripId: string, @Headers('authorization') authorization: string) {
    return this.appService.approveMembership(userId, tripId, authorization);
}

// client
export class NotificationsClient {
    private readonly api: NotificationsServiceApi;

    constructor(private readonly config: ConfigService) {
        this.api = new NotificationsServiceApi({ baseUrl: `${this.config.get('NOTIFICATIONS_SERVICE_URL')}/api/v1` });
    }

    async createNotification(payload: CreateNotificationPayload, authorization: string): Promise<void> {
        try {
            await this.api.createNotification({ body: payload, headers: { Authorization: authorization } });
        } catch (error) {
            this.logger.warn(`Failed to create notification for user ${payload.userId}`);
        }
    }
}
```

The receiving service's own `HybridAuthGuard` validates the forwarded token exactly like a normal user request — the target endpoint must **not** be `@Public()`. Reference: `apps/backend/users-service/src/app/clients/trips.client.ts` `getTravelHistory()`, and `apps/backend/trips-service/src/app/clients/messaging.client.ts` / `notifications.client.ts`. Kong is not involved in this — it stays routing/CORS only and does not verify JWTs (Better Auth signs with EdDSA by default, which Kong OSS's `jwt` plugin can't verify or fetch dynamically via JWKS). `@tc/server-api` is tagged `scope:shared`, so `scope:backend` projects are allowed to depend on it (see "Module boundaries" below); `@tc/api-sdk` itself carries no `scope:*` tag and is only a direct dependency of `@tc/server-api`/`@tc/client-api`, so backend/frontend code can never import it directly. There's no DI module for this — `<Service>Api` classes are plain classes constructed directly wherever needed (each caller needs a different `baseUrl`, which a bare NestJS provider can't express without a factory anyway).

### `@tc/utils`

- `DatabaseUtils` — DataSource factory with `SnakeNamingStrategy`
- `ApiResource` / `ApiResourceExceptions` — Swagger decorator helpers for controllers. `ApiResource({ ..., protected: true })` applies `@ApiBearerAuth('bearer')` so the route shows the lock icon in Swagger docs — pass it on every handler that isn't `@Public()`; omit (or leave `false`) on `@Public()` routes. Backing constant `SWAGGER_BEARER_AUTH` lives in `@tc/utils` and is re-exported from `@tc/core` for the `Swagger.build()` `DocumentBuilder.addBearerAuth()` call
- Services with multipart file upload endpoints (`users-service`, `trips-service`, `messaging-service`) need `"multer"` added to `tsconfig.app.json`'s `compilerOptions.types` array (alongside `"node"`) — otherwise `tsc` can't resolve `@types/multer`'s `Express.Multer.File` global augmentation even though the package is installed; webpack's build may still succeed while a plain `tsc --noEmit` fails
- `usernameValidator` and other small pure utilities
- **Put reusable non-domain helpers here** (not in `common` unless truly generic)

### `@tc/common`

- `HttpModule.forRoot(options?)` — registers NestJS `@nestjs/axios` with optional axios config (`timeout`, `httpAgent`, `baseURL`, etc.); registered globally via `@tc/core` `RootModule`
- `HttpClient.get/post/put/patch/delete/head/request` — use for **all internal and external HTTP calls** instead of `fetch` or direct `axios`
- `isHttpError()` — type guard for HTTP error responses
- Inject `HttpClient` in services and clients — axios is configured through `HttpModule.forRoot()`, not in `HttpClient`
- `StorageModule.forRoot(options?)` — registers an AWS SDK `S3Client` (`@aws-sdk/client-s3`); registered globally via `@tc/core` `RootModule`
- `StorageService.upload({ key, body, contentType })` / `.delete(key)` / `.getPublicUrl(key)` — use for **all object storage** (profile photos, trip cover images, chat attachments) instead of calling the AWS SDK directly; bucket/region/credentials come from `@tc/config` (`AWS_S3_BUCKET`, `AWS_REGION`, `AWS_S3_ENDPOINT`, `AWS_S3_PUBLIC_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
- Reference: `apps/backend/users-service/src/app/app.service.ts` `uploadAvatar()` + `POST /api/v1/profiles/me/avatar`; `apps/backend/trips-service/src/app/app.service.ts` `uploadCoverImage()` + `POST /api/v1/trips/:tripId/cover-image`; `apps/backend/messaging-service/src/app/app.service.ts` `uploadMessageAttachment()`/`uploadTripMessageAttachment()` + `POST .../messages/attachment` (all multipart, `FileInterceptor('file')` from `@nestjs/platform-express`)
- `EmailModule.forRoot(options?)` — registers `EmailService`, picking a `ConsoleEmailProvider` or `ResendEmailProvider` (via `HttpClient`) based on `@tc/config`'s `EMAIL_PROVIDER`/`RESEND_API_KEY`/`EMAIL_FROM`. `EmailService.send(input)` is fire-and-forget (`Promise` swallowed, errors logged) — used by `@tc/auth`'s `createAuth()` for password-reset and OTP-verification emails, injected via `AuthModule.forRoot()`'s own `EmailModule.forRoot()` import rather than duplicated per service

### Shared API SDK & wrapper libraries (`@tc/api-sdk`, `@tc/server-api`, `@tc/client-api`)

Three libraries split the generated-API surface by who's allowed to touch what:

- **`@tc/api-sdk`** (`library/shared/api-sdk`, tag `type:api-sdk`, no `scope:*` tag) — holds _all_ `hey-api`-generated code per backend microservice (types, fetch client, function-based SDK operations, `@tanstack/react-query` hooks) and nothing else. It is a strict leaf (`onlyDependOnLibsWithTags: []`) and is **never imported by apps directly** — module boundaries only allow `scope:shared` projects (i.e. the two wrapper libs below) to depend on it.
- **`@tc/server-api`** (`library/backend/server-api`, tags `scope:shared` + `type:server-api`) — backend-only wrapper for interservice calls that bypass Kong. Generates one `<Service>Api` class per service, constructed with an explicit `baseUrl` (the target service's own `*_SERVICE_URL` + `/api/v1`) and used exactly like the old `@tc/api-client` classes (see **Internal service-to-service calls** above).
- **`@tc/client-api`** (`library/frontend/client-api`, tags `scope:shared` + `type:client-api`) — frontend-only wrapper for calls routed through the Kong gateway. Generates one `configure<Service>Client(options)` function per service (imported via the `@tc/client-api/services/<service>` subpath) that points that service's shared `hey-api` client at the Kong base URL and re-exports its `@tanstack/react-query` hooks + SDK functions/types for direct use in React components. Supports both cookie-based session auth (`credentials: 'include'`, the default) and header-based auth (`auth` option — a static token or async callback) simultaneously.

Module boundaries (see below) additionally forbid `server-api` from depending on `client-api` and vice versa — pick the wrapper matching where your code runs, never both.

- **Source of truth for the service list**: `library/shared/api-sdk/src/client.registry.ts` exports `CLIENT_REGISTRY`, an array of service names (e.g. `'auth-service'`). Add a new domain here when its microservice gains an OpenAPI spec — all three codegen steps below read from this array.
- **Per-service SDKs**: `library/shared/api-sdk/src/client.config.ts` runs `@hey-api/openapi-ts` once per `CLIENT_REGISTRY` entry against `apps/backend/<service>/openapi/<service>.openapi.json`, with the `@hey-api/typescript`, `@hey-api/sdk` (function-based — **not** `operations.strategy: 'single'`, since the class/registry style is incompatible with clean `@tanstack/react-query` hook generation) and `@tanstack/react-query` plugins, emitting into `src/clients/<service>/` — a **separate output directory and client instance per service**, not merged into one combined client (an earlier merged-client design caused operationId collisions across services and got reverted). These generated files **are committed to git** (unlike the gitignored OpenAPI specs they're generated from).
- **`<Service>Api` server wrappers**: `library/backend/server-api/src/apis/<service>.server-api.ts` is generated — not hand-written. `scripts/generate-server-apis.ts` renders the Handlebars template `scripts/templates/server-api.template.hbs` (driven by `CLIENT_REGISTRY`) into one file per service — each a **plain class** (no NestJS `@Injectable()`, not wired through DI) named `<PascalService>Api`, constructed with `ServerApiOptions = { baseUrl: string }`. It binds every exported `@tc/api-sdk` operation function to a client built from that `baseUrl` via the generic `SdkBinder.bind()` helper (`library/backend/server-api/src/utils/bind-sdk.ts`) — an `export interface <PascalService>Api extends BoundSdk<typeof sdk> {}` merged with the class gives full per-operation typing (including `throwOnError: true` narrowing) without hand-listing every operation. `src/apis/index.ts` is the generated barrel exporting all five `<Service>Api` classes; import a service's request/response types via the `@tc/server-api/services/<service>` subpath (the barrel only re-exports classes, to avoid cross-service type name collisions).
- **Frontend service clients**: `library/frontend/client-api/src/apis/<service>.client-api.ts` is generated the same way from `scripts/generate-client-apis.ts` + `scripts/templates/client-api.template.hbs` — each file exports `configure<Service>Client(options: ClientApiOptions)` plus `export *` re-exports of that service's `@tc/api-sdk` SDK functions/types and `@tanstack/react-query` hooks. No barrel — always import via the `@tc/client-api/services/<service>` subpath.
- **Regenerate everything**: `bun run api:generate` (root) runs `nx run-many --target=api:generate`, which fans out to `server-api:api:generate` and `client-api:api:generate` — each `dependsOn: ["api-sdk:sdk:generate"]`, so `@tc/api-sdk` always regenerates first. Never hand-edit anything under `api-sdk/src/clients/<service>/`, `server-api/src/apis/`, or `client-api/src/apis/` — edit `client.registry.ts` or the relevant `.hbs` template instead and regenerate.
- **`scripts/` vs `src/`**: only `src/` is built/published in each of the three libs (`tsconfig.lib.json` excludes `src/client.config.ts` in `api-sdk`); `client.config.ts` and `scripts/**` are dev-only codegen tooling, type-checked separately via each lib's `tsconfig.scripts.json` and excluded from the `@nx/dependency-checks` lint rule (`eslint.config.mjs` `ignoredFiles`) since their deps (`@hey-api/openapi-ts`, `handlebars`, `prettier`) aren't part of the runtime package.
- **Backend usage**: `import { NotificationsServiceApi } from '@tc/server-api'; const api = new NotificationsServiceApi({ baseUrl: 'http://localhost:3004/api/v1' }); await api.createNotification({ body, headers });` — construct directly wherever needed; there's no DI module, since each caller needs a different `baseUrl` per target service, which a bare NestJS provider can't express without a factory anyway.
- **Frontend usage**: call `configureTripsServiceClient({ baseUrl: \`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/v1\`, auth: () => session?.token })`once at app startup — appending`/api/v1`for the same reason as`server-api`(Kong's declarative routes and the generated SDK's operation paths both expect it;`NEXT_PUBLIC_API_GATEWAY_URL`itself, e.g.`http://localhost:8000`, is just the bare Kong origin) — then import hooks directly, e.g. `import { listMyTripsOptions } from '@tc/client-api/services/trips-service'; const { data } = useQuery(listMyTripsOptions());`. Reference: `apps/frontend/web/src/auth.ts`configures`auth-service`'s client this way and calls `signIn`from`@tc/client-api/services/auth-service`inside NextAuth's`Credentials`provider`authorize()`to back`/login` with real sign-in instead of mock data.
- **Per-service subpath imports on `@tc/api-sdk`** (for `server-api`/`client-api` internals — apps never reach these directly): `@tc/api-sdk/clients/<service>` (SDK functions + types), `@tc/api-sdk/clients/<service>/client` (the `createClient`/`createConfig` factory), `@tc/api-sdk/clients/<service>/client.gen` (the preconfigured singleton `client`), `@tc/api-sdk/clients/<service>/react-query` (the `@tanstack/react-query` hooks). The top-level barrel (`src/index.ts`) only re-exports `CLIENT_REGISTRY`/`ApiSdkUtils` — a flat `export *` across all five `clients/<service>` modules collides on `ClientOptions`/`Options`, which hey-api hardcodes per service and can't rename via plugin config, so those types are only reachable through their own service's subpath, never the root import.

## Dependency Direction

```
apps/backend/*  →  @tc/core, @tc/auth, @tc/config, @tc/common, @tc/utils, …
@tc/core  →  @tc/config, @tc/common, @tc/database
@tc/database  →  @tc/config, @tc/utils
@tc/auth  →  @tc/common, @tc/config, @tc/utils
```

Libraries must not import from apps. Avoid circular deps between libraries. `@tc/config` and `@tc/utils` should stay at the bottom of the graph.

## Current Projects

| Project                 | Type | Purpose                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-service`          | app  | Auth microservice — REST API (`/api/v1/auth/*`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `users-service`         | app  | User profiles microservice — REST API (`/api/v1/profiles/*`), incl. `POST /api/v1/profiles/me/avatar` avatar upload via `@tc/common` `StorageService`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `trips-service`         | app  | Trips microservice — organizer CRUD/lifecycle, public discovery, join/leave/approve membership, `POST /api/v1/trips/:tripId/cover-image` cover image upload via `@tc/common` `StorageService`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `messaging-service`     | app  | Messaging microservice — direct conversations, trip group chat, send/list messages, attachment upload (`POST .../messages/attachment`) via `@tc/common` `StorageService`, `/conversations` WebSocket gateway (`message:new`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `notifications-service` | app  | Notifications microservice — list/create/mark-read notifications, `/notifications` WebSocket gateway (`notification:created`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `web`                   | app  | Next.js web frontend (App Router, `apps/frontend/web`, tags `web,scope:frontend`) — Chakra UI app shell (`@tc/ui`). Auth flow is wired to real `auth-service` through Kong via `@tc/client-api` (`src/lib/auth-service-client.ts` configures the client once): routes under the `src/app/(auth)/` route group (`login`, `register`, `verify-email`, `forgot-password`, `reset-password`; the group doesn't affect the URL), each `page.tsx` rendering a form component from `src/components/auth/` (server actions colocated as `<page>-actions.ts`). Trips are also wired to real `trips-service` (`src/lib/trips-service-client.ts`, same one-time-configure pattern): `/trips` and `/trips/[tripId]` (public `discoverTrips`/`getPublicTrip`), the homepage's featured-trips section, `/destinations/[id]`'s trips-at-destination section, and `/dashboard/trips` (organizer's own trips via `listMyTrips`, threading the NextAuth session's `accessToken` as a per-request `Authorization` header — trips-service has no per-user "joined trips" endpoint yet, so `/dashboard/trips/joined` stands in with a slice of public `discoverTrips` results). Everything else is still mock-data-only (`@tc/mocks`), pending real API integration: `/destinations` (no destinations-service exists), `/dashboard` overview stats, `/messages`, `/notifications`, `/profile`; `/settings` is a real "coming soon" placeholder (no mock data model, no protected-route pattern exists yet to back a working form). Non-route components live under `src/components/<feature>/` (e.g. `src/components/shell/app-navbar.tsx`), never inside `src/app/` |
| `auth`                  | lib  | Shared Better Auth integration (guards, adapter), shared JWT verification (`verifyAuthToken`) and WebSocket auth guard (`WsAuthGuard`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `core`                  | lib  | Bootstrap & Swagger                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `config`                | lib  | Environment & config                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `database`              | lib  | TypeORM, entities (`auth/` + `general/`), migrations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `utils`                 | lib  | Shared utilities                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `common`                | lib  | Shared HTTP client (`HttpModule`/`HttpClient`) and S3 object storage (`StorageModule`/`StorageService`, AWS SDK)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `ui`                    | lib  | `library/frontend/ui` (tag `scope:frontend`) — shared Chakra UI v3 component library for `web` (app shell, form fields, cards, theme)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `state`                 | lib  | `library/frontend/state` (tag `scope:frontend`) — shared Zustand stores for `web` (e.g. `useNotificationsStore`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `mocks`                 | lib  | `library/frontend/mocks` (tag `scope:frontend`) — placeholder mock data (trips, destinations, users, messaging, notifications) backing `web`'s not-yet-integrated pages, pending real service wiring                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `api-sdk`               | lib  | `library/shared/api-sdk` (tag `type:api-sdk`, no `scope:*`) — raw generated `hey-api` SDK (types, client, functions, `@tanstack/react-query` hooks) per backend service; never imported by apps directly, only by `server-api`/`client-api`; see **Shared API SDK & wrapper libraries** below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `server-api`            | lib  | `library/backend/server-api` (tags `scope:shared`, `type:server-api`) — backend-only `<Service>Api` wrapper classes for interservice calls that bypass Kong; see **Shared API SDK & wrapper libraries** below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `client-api`            | lib  | `library/frontend/client-api` (tags `scope:shared`, `type:client-api`) — frontend-only per-service `configure*Client()` + `@tanstack/react-query` hooks routed through Kong; see **Shared API SDK & wrapper libraries** below                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

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
// apps/backend/my-service/jest.config.cts
const { createAppUnitJestConfig } = require('../../jest/create-app-unit-config.cjs');
module.exports = createAppUnitJestConfig('my-service', __dirname);
```

### Lib Jest config

Libraries use the same `__tests__/unit/` layout. New libs only need a thin wrapper:

```javascript
// library/backend/my-lib/jest.config.cts
const { createLibJestConfig } = require('../../jest/create-lib-jest-config.cjs');
module.exports = createLibJestConfig('my-lib', __dirname);
```

**Never colocate specs under `src/`** — all unit tests belong under `__tests__/unit/` (apps and libraries alike). Import source via `../../src/...` from spec files.

The `auth` library uses **Vitest** for adapter tests — place specs in `library/backend/auth/__tests__/unit/` and wire `vitest.config.ts` to that path.

### Controllers

- Use `@ApiTags()` on the controller class
- Use `@ApiResource()` and `@ApiResourceExceptions()` from `@tc/utils` on endpoints; pass `protected: true` to `@ApiResource()` on any handler that isn't `@Public()` so Swagger UI shows the lock only where auth is actually required
- DTOs: class-validator decorators + `@ApiProperty()` for Swagger
- Place DTOs in `src/app/dto/`, export via `dto/index.ts`
- `AuthGuard` is registered globally via `RootModule` — all routes require a valid JWT access token by default
- Use `@Public()` from `@tc/auth` on controllers or handlers to skip authentication

### Gateways (WebSocket)

- **Guards never run for `handleConnection`** — NestJS only invokes `@UseGuards()` around `@SubscribeMessage()` handlers, never around gateway lifecycle hooks. Auth must happen via an explicit guarded message handler, not in `handleConnection`.
- Pattern: client connects, then emits a guarded "join" message (e.g. `conversations:join`, `notifications:join`) to authenticate and join its rooms; the handler returns an ack payload. See `apps/backend/messaging-service/src/app/gateways/conversations.gateway.ts` and `apps/backend/notifications-service/src/app/gateways/notifications.gateway.ts`.
- Guard with `@UseGuards(WsAuthGuard)` from `@tc/auth` on the `@SubscribeMessage()` handler; it sets `client.data.userId` from the verified JWT.
- `app.useWebSocketAdapter(new IoAdapter(app.getHttpServer()))` — pass the raw HTTP server, not the Nest app instance. Passing `app` relies on an `instanceof NestApplication` check that fails across this monorepo's separately bundled packages (webpack app bundles vs esbuild lib bundles each carry their own `@nestjs/core`).

### Modules

- Service modules import shared libs (`AuthModule.forRoot()` where needed, etc.) and declare domain controllers/providers
- `RootModule` (from `@tc/core`) provides Config + Database globally
- Each microservice owns its domain module; do not split domain logic into `library/backend/<domain>/`

## Coding Standards

1. **TypeScript strict mode** — no `any` unless unavoidable; use definite assignment (`!`) on DTO fields
2. **ESM** — libraries use `"type": "module"`; respect existing import style. `isolatedModules` is off workspace-wide, so type-only exports/re-exports don't need the `export type` keyword (e.g. `export { ApplicationBootstrapOptions } from './contract'`) — esbuild resolves the full module graph and elides them automatically
3. **NestJS conventions** — modules, controllers, services, DTOs; inject dependencies via constructor
4. **Prefer classes over standalone functions** — use classes for reusable utilities, helpers, and service-style APIs; reserve functions for thin factories, hooks, and one-off entrypoints
5. **Minimize scope** — smallest correct diff; don't refactor unrelated code
6. **Match existing patterns** — read surrounding files before writing; reuse existing abstractions
7. **Comments** — only for non-obvious logic; code should be self-explanatory
8. **Tests** — add only when they cover meaningful behavior. **All tests live under `__tests__/unit/`** — never colocate `*.spec.ts` under `src/`. Apps: Jest unit specs (`createAppUnitJestConfig`). Libraries: Jest (`createLibJestConfig`); Vitest for `auth` lib adapter tests. **E2e suites are out of scope pre-go-live** — see Testing scope note above; do not add `__tests__/e2e/`, e2e Jest configs, or `@tc/testing`-style helpers.
9. **No secrets in code** — env vars via `@tc/config`; never commit `.env`
10. **Module boundaries** — ESLint `@nx/enforce-module-boundaries` enforces `scope:backend`/`scope:frontend`/`scope:shared` tags (set in each `project.json`): backend code may only depend on backend or shared code, and `scope:frontend` code (e.g. `apps/frontend/web`, tagged `web,scope:frontend`) may only depend on `scope:frontend`/`scope:shared`. Tag any new project under `apps/backend/` or `library/backend/` with `scope:backend`; tag frontend projects under `apps/frontend/` with `scope:frontend`. **`@tc/api-sdk` is a deliberate exception**: it carries only `type:api-sdk` (no `scope:*` tag), so it never satisfies the `scope:backend`/`scope:frontend` allow-lists and can't be imported by apps or ordinary libs — only `scope:shared` projects (`@tc/server-api`, `@tc/client-api`) are allowed to depend on it directly (`onlyDependOnLibsWithTags: ['scope:shared', 'type:api-sdk']` on the `scope:shared` constraint). `notDependOnLibsWithTags` additionally keeps `@tc/server-api` and `@tc/client-api` from depending on each other. See **Shared API SDK & wrapper libraries** below for why this three-library split exists.
11. **Repositories** — extend `BaseRepository` in `apps/backend/<service>/src/app/repositories/`; inject via `@InjectDataSource()`; import `DataSource` types from `@tc/database`; never add direct `typeorm` to apps
12. **Keep docs in sync** — when adding features, endpoints, services, entities, env vars, or patterns, update related markdown in the same change (see **Documentation sync** below)

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
bun nx affected -t lint test build            # Only changed projects

# Database
bun run migration:run                         # Build bundled CJS runner, then apply migrations
bun run migration:generate                  # Generate migration (pass --name=...)

# Auth (entities only — then use migration:generate for schema)
bun run auth:generate                         # Regenerate auth TypeORM entities in entities/auth/

# OpenAPI
bun run openapi:generate                      # Regenerate <service>.openapi.json for every backend service
bun nx run auth-service:openapi:generate      # Regenerate it for a single service

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
5. **Generate, don't hand-scaffold** — use `nx-generate` skill for new **services** and shared libs
6. **One service per domain** — new domains get `apps/backend/<domain>-service/`, not `library/backend/<domain>/`
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
| `project-status`          | What to work on next, roadmap vs repo state                    |
| `docs-sync`               | After implementing features — which docs to update             |

Workspace skills live in `.agents/skills/`. Read the relevant skill file before acting — don't improvise Nx commands when a skill exists.

## Planning & Execution

When given a task:

1. **Clarify scope** — is this a new microservice, shared lib change, bug fix, or infra change?
2. **Identify affected projects** — `bun nx show projects`, check dependency graph
3. **Pick the right target** — new domain → `apps/backend/<domain>-service/`; cross-cutting → `library/backend/<name>/`
4. **Read existing code** in that area before writing
5. **Scaffold if needed** — `nx-generate` skill for new services
6. **Wire dependencies** — `link-workspace-packages` skill
7. **Implement minimally** — match patterns in `auth-service`, `users-service`, and sibling shared libs
8. **Update documentation** — invoke `docs-sync` skill; update `docs/PROJECT.md`, `AGENTS.md`, and any affected skills/rules in the **same change** as new features or patterns
9. **Verify** — `bun nx affected -t lint test build` on touched projects
10. **Don't commit unless asked** — user controls git operations

## Documentation sync

**Required:** When you implement a new feature, endpoint, service, entity, env var, architectural pattern, or change user-visible behavior, update the related markdown in the **same PR/change** — not as a follow-up.

Invoke the `docs-sync` skill for the checklist. At minimum, consider:

| Change type                            | Update                                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| New microservice                       | `AGENTS.md` (Current Projects, layout), `docs/PROJECT.md` (architecture/services)                |
| New API endpoints                      | `docs/PROJECT.md` (feature status if applicable), Bruno collections if the service uses them     |
| New entity / migration                 | `AGENTS.md` / `docs/PROJECT.md` (entity layout), `docs/PROJECT.md` database section              |
| New env var                            | `library/backend/config/src/lib/env.schema.ts` + mention in `AGENTS.md` if service-specific port |
| New shared pattern (e.g. repositories) | `AGENTS.md`, `CLAUDE.md`, relevant `.agents/skills/`                                             |
| Priority / roadmap shift               | `docs/PROJECT.md`, `.agents/skills/project-status/SKILL.md`                                      |

Do not leave `AGENTS.md` or `docs/PROJECT.md` stale after shipping code.

For auth-related work, always check `library/backend/auth/src/lib/auth.config.ts` and the Better Auth plugin setup before changing behavior. After `auth:generate`, always follow with TypeORM `migration:generate` / `migration:run` — never rely on the adapter to write migration files.

## Patches & Special Notes

- `@hedystia/better-auth-typeorm@1.0.1` is patched via `patches/` (bun `patchedDependencies`) — schema-aware entity generation, PostgreSQL `auth` schema, and `generateMigrations: false` (entities only)
- Auth entities: `library/backend/database/src/entities/auth/` (PostgreSQL schema `auth`)
- Non-auth entities: `library/backend/database/src/entities/general/` (PostgreSQL schema `general`)
- `auth` lib tests use Vitest; most other projects use Jest
- API routes are versioned: `/api/v1/...` (configured in `bootstrapApplication`)
