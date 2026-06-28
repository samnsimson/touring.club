---
name: qa
description: Runs all unit and e2e tests across the Touring Club Nx monorepo, fixes failures, and enforces coverage requirements. Use when the user invokes QA, asks to run all tests, fix failing tests, check coverage, keep test suites green, or verify the full test matrix for apps and libraries.
---

# QA — Full Monorepo Test Health

Goal: **all unit and e2e suites pass**, and **app unit coverage meets thresholds**.

Package manager: **Bun**. Prefix every Nx command with `bun` (e.g. `bun nx run-many -t test`).

## Prerequisites

Before running e2e (required for full QA):

1. PostgreSQL running: `docker compose up -d`
2. `.env` at workspace root with valid `DATABASE_URL` (and other vars from `@tc/config` `EnvSchema`)
3. Migrations applied — e2e `global-setup.ts` files call `runDatabaseMigrations()` when `DATABASE_URL` is set; if migrations fail, run `bun run migration:run` first

Unit tests depend on library builds (`test` → `dependsOn: ["^build"]`). If imports fail, run `bun nx run-many -t build` once.

E2e global setup uses `runDatabaseMigrations()` from `@tc/testing`, which invokes the bundled migration runner directly (not nested `nx run`) to avoid Nx recursion. Ensure the runner exists first:

```bash
bun nx run database:build-migrations
# or: bun run migration:run
```

When running all e2e suites together, prefer sequential execution to avoid setup races:

```bash
bun nx run-many -t e2e --parallel=1 --skipNxCache
```

## Discover projects

```bash
bun nx show projects --withTarget test --json
bun nx show projects --withTarget e2e --json
```

**Current matrix (verify with commands above):**

| Target | Projects                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------- |
| `test` | All 5 `*-service` apps + libs: `auth`, `common`, `config`, `core`, `database`, `testing`, `utils` |
| `e2e`  | `auth-service`, `users-service`, `trips-service`, `messaging-service`, `notifications-service`    |

`auth` lib uses **Vitest** (`vitest run --config library/auth/vitest.config.ts`); everything else uses **Jest**.

Use `nx show project <name> --json` for resolved targets — do not rely on `project.json` alone.

## QA workflow

Copy and track progress:

```
QA Progress:
- [ ] Step 1: Build dependencies
- [ ] Step 2: Run all unit tests with coverage
- [ ] Step 3: Fix unit failures + coverage gaps
- [ ] Step 4: Run all e2e tests
- [ ] Step 5: Fix e2e failures
- [ ] Step 6: Final verification (unit + e2e green)
```

### Step 1 — Build

```bash
bun nx run-many -t build
```

### Step 2 — Unit tests (with coverage)

Run every project’s unit suite with the `ci` configuration (enables coverage reporters on apps):

```bash
bun nx run-many -t test --configuration=ci --skipNxCache
```

To debug a single project:

```bash
bun nx run <project>:test --configuration=ci --skipNxCache
```

For `auth` (Vitest): `bun nx run auth:test --skipNxCache`

### Step 3 — Fix unit failures and coverage

**Fix failures first**, then coverage. Work project-by-project; re-run only the failing project until green.

**Coverage requirements (apps only)** — defined in `jest/create-app-unit-config.cjs`:

| Metric     | Threshold |
| ---------- | --------- |
| statements | 100%      |
| lines      | 100%      |
| functions  | 100%      |

Collected from `src/**/*.{ts,tsx}` **excluding**: `*.dto.ts`, `dto/**`, `main.ts`, `entities/**`.

Libraries have no global coverage threshold in Jest config; still fix failing lib tests and add coverage when a lib’s `project.json` enables `coverage: true`.

**When coverage is below threshold:**

1. Read the text coverage summary from the failed run, or open `coverage/<projectRoot>/index.html`
2. Identify uncovered lines in **non-excluded** source files
3. Add or extend specs under `__tests__/unit/` (never colocate `*.spec.ts` under `src/`)
4. Match existing patterns in that project’s specs (mock repositories, `Test.createTestingModule`, etc.)
5. Re-run `bun nx run <project>:test --configuration=ci` until thresholds pass

**Do not** lower `coverageThreshold` or broaden `collectCoverageFrom` exclusions to “fix” coverage — add meaningful tests instead.

### Step 4 — E2e tests

```bash
bun nx run-many -t e2e --parallel=1 --skipNxCache
```

Single project: `bun nx run <service>:e2e --skipNxCache`

E2e uses `jest/.e2e.swcrc` and `jest/.e2e-database.swcrc` (see `AGENTS.md`). Requires Postgres + `DATABASE_URL`.

### Step 5 — Fix e2e failures

1. Read the full Jest output (`--verbose` if needed)
2. Follow `.cursor/rules/e2e-test-format.mdc` — reference: `apps/auth-service/__tests__/e2e/auth-password.e2e.spec.ts`
3. Use `@tc/testing` helpers: `E2EApplication`, `E2EApi`, `requireDatabase`, `FixtureAuthGuard`, `runDatabaseMigrations`
4. DB-gated tests: `if (!requireDatabase('…')) return;`
5. Re-run the failing service’s e2e target until green

Common e2e failure causes: missing Postgres, stale schema (run migrations), missing env vars, incorrect auth fixture headers.

### Step 6 — Final verification

```bash
bun nx run-many -t test --configuration=ci --skipNxCache
bun nx run-many -t e2e --parallel=1 --skipNxCache
```

Both must exit 0 with no coverage threshold failures.

## Fix discipline

- **Smallest correct diff** — fix the root cause; don’t disable tests or skip assertions
- **Match repo patterns** — repositories in `apps/<service>/src/app/repositories/`, specs in `__tests__/`
- **No direct `typeorm` in apps** — import from `@tc/database`
- **New tests** must cover real behavior, not implementation trivia
- After adding endpoints/features via fixes, invoke `docs-sync` only if behavior changed (not for test-only changes)

## Iteration strategy

| Situation             | Approach                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Many unit failures    | `bun nx run-many -t test --configuration=ci` without `--nxBail`; group by project                                    |
| Single flaky e2e      | Re-run once; if persistent, inspect DB state and `global-setup` / `global-teardown`                                  |
| Build blocks tests    | Fix build first (`bun nx run <project>:build`)                                                                       |
| Only touched projects | `bun nx affected -t test --configuration=ci` then `bun nx affected -t e2e` — use for incremental QA, not full matrix |

## Related skills

- `nx-run-tasks` — Nx flags (`--parallel`, `--exclude`, `--verbose`)
- `nx-workspace` — discover targets and project config
- `monitor-ci` — CI pipeline failures (use when QA is triggered from a red CI run)

## Success criteria

QA is complete when:

1. `bun nx run-many -t test --configuration=ci` passes for every project with a `test` target
2. `bun nx run-many -t e2e --parallel=1` passes for every project with an `e2e` target
3. App unit coverage meets 100% statements / lines / functions per `create-app-unit-config.cjs`
4. No tests were skipped, commented out, or weakened to force green
