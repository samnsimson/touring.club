---
name: qa
description: Runs lint and all unit tests across the Touring Club Nx monorepo, fixes failures, and enforces coverage requirements. Use when the user invokes QA, asks to run all tests, fix failing tests, check coverage, or keep test suites green.
---

# QA — Full Monorepo Test Health

Goal: **lint is clean**, **all unit suites pass**, and **app unit coverage meets thresholds**.

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

`auth` lib uses **Vitest** (`vitest run --config library/backend/auth/vitest.config.ts`); everything else uses **Jest**.

Use `nx show project <name> --json` for resolved targets — do not rely on `project.json` alone.

## QA workflow

Copy and track progress:

```
QA Progress:
- [ ] Step 1: Build dependencies
- [ ] Step 2: Lint (catches @nx/dependency-checks package.json drift)
- [ ] Step 3: Run all unit tests with coverage
- [ ] Step 4: Fix lint + unit failures + coverage gaps
- [ ] Step 5: Final verification
```

### Step 1 — Build

```bash
bun nx run-many -t build
```

### Step 2 — Lint

```bash
bun nx run-many -t lint --skipNxCache
```

This runs `@nx/dependency-checks` per project, which catches `package.json` drift that `test`/`build` won't surface:

- a project imports a package not listed in its `dependencies` (missing dep — runtime works today via hoisting/transitive resolution, but breaks in isolated installs/publishing)
- a project lists a dep in `package.json` that nothing in `src/` imports (unused dep)

This class of bug is easy to introduce during restructures/moves (file relocated, import path changed, `package.json` not updated to match) and **will not fail `build` or `test`** — only `lint` catches it. Always run lint as part of QA, not just tests.

To debug a single project: `bun nx run <project>:lint --skipNxCache`

If a lint failure is flagged as "flaky" by Nx Cloud in the run summary, rerun just that project before treating it as real — but always rerun to confirm, don't assume flaky.

### Step 3 — Unit tests (with coverage)

Run every project's unit suite with the `ci` configuration (enables coverage reporters on apps):

```bash
bun nx run-many -t test --configuration=ci --skipNxCache
```

To debug a single project:

```bash
bun nx run <project>:test --configuration=ci --skipNxCache
```

For `auth` (Vitest): `bun nx run auth:test --skipNxCache`

### Step 4 — Fix lint, unit failures, and coverage

**Fix lint dependency-check errors first** (smallest, most mechanical), then test failures, then coverage. Work project-by-project; re-run only the failing project until green.

**Fixing `@nx/dependency-checks` errors:**

- "missing from dependencies" → add the package to that project's `package.json` `dependencies` at the version used elsewhere in the repo (check root `package.json` or a sibling lib for the existing version range) — do not guess a version
- "not used by `<project>`" → remove the unused entry from `dependencies`; first double check no `src/` file imports it (the rule is reliable but confirm with `grep` before deleting)
- Never silence these with eslint-disable or by broadening lint excludes — the dependency list must reflect real imports
- Re-run `bun nx run <project>:lint --skipNxCache` until clean, then `bun nx run <project>:build` to make sure removing/adding deps didn't break the build

**Coverage requirements (apps only)** — defined in `jest/create-app-unit-config.cjs`:

| Metric     | Threshold |
| ---------- | --------- |
| statements | 100%      |
| lines      | 100%      |
| functions  | 100%      |

Collected from `src/**/*.{ts,tsx}` **excluding**: `*.dto.ts`, `dto/**`, `main.ts`, `entities/**`.

Libraries have no global coverage threshold in Jest config; still fix failing lib tests and add coverage when a lib's `project.json` enables `coverage: true`.

**When coverage is below threshold:**

1. Read the text coverage summary from the failed run, or open `coverage/<projectRoot>/index.html`
2. Identify uncovered lines in **non-excluded** source files
3. Add or extend specs under `__tests__/unit/` (never colocate `*.spec.ts` under `src/`)
4. Match existing patterns in that project's specs (mock repositories, `Test.createTestingModule`, etc.)
5. Re-run `bun nx run <project>:test --configuration=ci` until thresholds pass

**Do not** lower `coverageThreshold` or broaden `collectCoverageFrom` exclusions to "fix" coverage — add meaningful tests instead.

### Step 5 — Final verification

```bash
bun nx run-many -t lint test --configuration=ci --skipNxCache
```

Must exit 0 with no lint errors and no coverage threshold failures. If a task is flagged "flaky" in the Nx run summary, rerun just that task to confirm it's not a real failure before calling QA done.

## Fix discipline

- **Smallest correct diff** — fix the root cause; don't disable tests or skip assertions, don't eslint-disable a `@nx/dependency-checks` error
- **Match repo patterns** — repositories in `apps/backend/<service>/src/app/repositories/`, specs in `__tests__/unit/`
- **No direct `typeorm` in apps** — import from `@tc/database`
- **New tests** must cover real behavior, not implementation trivia
- After adding endpoints/features via fixes, invoke `docs-sync` only if behavior changed (not for test-only changes)

## Iteration strategy

| Situation              | Approach                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Many unit failures     | `bun nx run-many -t test --configuration=ci` without `--nxBail`; group by project           |
| Build blocks tests     | Fix build first (`bun nx run <project>:build`)                                              |
| Lint dependency errors | `bun nx run-many -t lint --skipNxCache`; fix `package.json` per-project, see Step 4         |
| Only touched projects  | `bun nx affected -t lint test --configuration=ci` — use for incremental QA, not full matrix |
| Task flagged "flaky"   | Rerun that single task in isolation before treating it as a real failure                    |

## Related skills

- `nx-run-tasks` — Nx flags (`--parallel`, `--exclude`, `--verbose`)
- `nx-workspace` — discover targets and project config
- `monitor-ci` — CI pipeline failures (use when QA is triggered from a red CI run)

## Success criteria

QA is complete when:

1. `bun nx run-many -t lint` passes for every project with a `lint` target — no `@nx/dependency-checks` or other lint errors
2. `bun nx run-many -t test --configuration=ci` passes for every project with a `test` target
3. App unit coverage meets 100% statements / lines / functions per `create-app-unit-config.cjs`
4. No tests were skipped, commented out, or weakened to force green; no lint errors silenced via disable comments or loosened rules
