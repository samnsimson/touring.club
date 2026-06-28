---
name: qa
description: Runs all unit tests across the Touring Club Nx monorepo, fixes failures, and enforces coverage requirements. Use when the user invokes QA, asks to run all tests, fix failing tests, check coverage, or keep test suites green.
---

# QA — Full Monorepo Test Health

Goal: **all unit suites pass**, and **app unit coverage meets thresholds**.

Package manager: **Bun**. Prefix every Nx command with `bun` (e.g. `bun nx run-many -t test`).

> **E2e is out of scope pre-go-live.** E2e suites, `@tc/testing`, and all e2e tooling were intentionally removed from this repo (see `AGENTS.md` "Testing scope"). Do not add e2e tests, configs, or attempt to run an `e2e` target — none exist.

## Prerequisites

Unit tests depend on library builds (`test` → `dependsOn: ["^build"]`). If imports fail, run `bun nx run-many -t build` once.

## Discover projects

```bash
bun nx show projects --withTarget test --json
```

**Current matrix (verify with command above):**

| Target | Projects                                                                               |
| ------ | -------------------------------------------------------------------------------------- |
| `test` | All 5 `*-service` apps + libs: `auth`, `common`, `config`, `core`, `database`, `utils` |

`auth` lib uses **Vitest** (`vitest run --config library/auth/vitest.config.ts`); everything else uses **Jest**.

Use `nx show project <name> --json` for resolved targets — do not rely on `project.json` alone.

## QA workflow

Copy and track progress:

```
QA Progress:
- [ ] Step 1: Build dependencies
- [ ] Step 2: Run all unit tests with coverage
- [ ] Step 3: Fix unit failures + coverage gaps
- [ ] Step 4: Final verification
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

### Step 4 — Final verification

```bash
bun nx run-many -t test --configuration=ci --skipNxCache
```

Must exit 0 with no coverage threshold failures.

## Fix discipline

- **Smallest correct diff** — fix the root cause; don’t disable tests or skip assertions
- **Match repo patterns** — repositories in `apps/<service>/src/app/repositories/`, specs in `__tests__/unit/`
- **No direct `typeorm` in apps** — import from `@tc/database`
- **New tests** must cover real behavior, not implementation trivia
- After adding endpoints/features via fixes, invoke `docs-sync` only if behavior changed (not for test-only changes)

## Iteration strategy

| Situation             | Approach                                                                               |
| --------------------- | -------------------------------------------------------------------------------------- |
| Many unit failures    | `bun nx run-many -t test --configuration=ci` without `--nxBail`; group by project      |
| Build blocks tests    | Fix build first (`bun nx run <project>:build`)                                         |
| Only touched projects | `bun nx affected -t test --configuration=ci` — use for incremental QA, not full matrix |

## Related skills

- `nx-run-tasks` — Nx flags (`--parallel`, `--exclude`, `--verbose`)
- `nx-workspace` — discover targets and project config
- `monitor-ci` — CI pipeline failures (use when QA is triggered from a red CI run)

## Success criteria

QA is complete when:

1. `bun nx run-many -t test --configuration=ci` passes for every project with a `test` target
2. App unit coverage meets 100% statements / lines / functions per `create-app-unit-config.cjs`
3. No tests were skipped, commented out, or weakened to force green
