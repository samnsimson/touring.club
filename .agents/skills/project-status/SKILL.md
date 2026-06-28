---
name: project-status
description: Compare docs/PROJECT.md priorities and target architecture against the current repo state, then recommend the single best next action item. USE WHEN the user asks what to work on next, wants a project status brief, roadmap vs reality check, or asks to compare project detail with current repo state.
---

# Project Status

Produce a concise status brief: where the repo stands vs `docs/PROJECT.md`, then one clear **next action item**.

## Sources of truth

| Source                                   | Purpose                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [docs/PROJECT.md](../../docs/PROJECT.md) | Product vision, feature list, **development priorities** (ordered 1–7), microservices architecture |
| [AGENTS.md](../../AGENTS.md)             | What is implemented today, repo layout, entity paths, commands                                     |
| Git                                      | `git status`, `git log --oneline -15`, recent commit themes                                        |
| Nx                                       | `bun nx show projects`, `bun nx show project <name> --json`                                        |

Read `docs/PROJECT.md` and `AGENTS.md` first. Do not guess priorities from memory.

## Architecture assumptions

- **Microservices** — one NestJS app per domain under `apps/backend/<domain>-service/`
- **Libraries** — shared infrastructure only (`@tc/config`, `@tc/core`, `@tc/database`, `@tc/auth`, `@tc/utils`); no domain libs
- **Testing scope** — only unit tests are maintained pre-go-live; e2e suites and `@tc/testing` were intentionally removed (see `AGENTS.md` "Testing scope") — don't recommend e2e work as a next action item unless the user explicitly asks to resume it
- **Entities** — auth in `entities/auth/` (schema `auth`); all other domains in `entities/general/` (schema `general`)
- **Repositories** — `BaseRepository` in `@tc/database`; each service extends it in `apps/backend/<service>/src/app/repositories/`
- **Docs** — update `docs/PROJECT.md`, `AGENTS.md`, and related skills in the same change as new features (see `docs-sync` skill)

## Workflow

### 1. Load project detail

From `docs/PROJECT.md`, extract:

- **Development priorities** (section "Current Development Priorities") — the ordered backlog
- **Core features** under each priority area
- **Planned microservices** vs shared libs

### 2. Inventory current repo state

Run or inspect:

```bash
git status
git log --oneline -15
bun nx show projects
```

Then map reality:

| Check               | How                                                               |
| ------------------- | ----------------------------------------------------------------- |
| Deployable services | `bun nx show projects` — `auth-service`, `users-service` today    |
| Shared libs         | `config`, `core`, `database`, `auth`, `utils`, `common`           |
| Auth endpoints      | `apps/backend/auth-service/src/app/app.controller.ts`             |
| Profile endpoints   | `apps/backend/users-service/src/app/app.controller.ts`            |
| Auth integration    | `library/backend/auth/src/lib/auth.config.ts`                     |
| Auth entities       | `library/backend/database/src/entities/auth/`                     |
| General entities    | `library/backend/database/src/entities/general/` (e.g. `Profile`) |
| Unit tests          | `apps/backend/<service>/__tests__/unit/`                          |
| Test layout         | All specs under `__tests__/unit/` (apps and libraries alike)      |

Optionally verify health:

```bash
bun nx affected -t lint test build
```

### 3. Build a priority matrix

For each item in the **ordered priorities**, mark status:

| Status          | Meaning                                                          |
| --------------- | ---------------------------------------------------------------- |
| **Done**        | Feature exists in the owning microservice, tested at MVP level   |
| **Partial**     | Started but missing features, service scaffold, tests, or polish |
| **Not started** | No microservice or entities for this priority                    |
| **Deferred**    | Explicitly out of scope for now (note why)                       |

Map each priority to its **microservice** (e.g. Priority 2 → `users-service`, not a `users` lib).

### 4. Identify the next action item

Pick **one** actionable task using these rules:

1. **Work in priority order** — finish or explicitly close Priority N before starting Priority N+1, unless Priority N is Done.
2. **Finish in-flight work first** — uncommitted changes, failing tests, duplicate/stale files beat new features.
3. **Prefer vertical slices** — scaffold **service** + entity in `entities/general/` + migration + API + test.
4. **Match repo patterns** — scaffold with the canonical NestJS app command (see `nx-generate` skill); entities in `@tc/database`; repositories extend `BaseRepository`; run `docs-sync` after implementing features.
5. **Be specific** — weak: "Start user profiles"; strong: "Scaffold `users-service` with Profile entity in `entities/general/`, migration, and GET/PATCH `/api/v1/profiles/me`".

If multiple items tie, prefer the one that unblocks the next priority.

## Output format

Use this template:

```markdown
## Project status

**Branch / git:** [clean | dirty — summary]
**Current focus:** Priority N — [name]

### Priority progress

| #   | Area           | Service       | Status | Notes |
| --- | -------------- | ------------- | ------ | ----- |
| 1   | Authentication | auth-service  | …      | …     |
| 2   | User profiles  | users-service | …      | …     |
| …   | …              | …             | …      | …     |

### Repo snapshot

- **Services:** …
- **Shared libs:** …
- **Recent work:** … (from git log)
- **Gaps / debt:** …

### Next action item

> **[One imperative sentence]**

**Why now:** [1–2 sentences]
**Suggested commands:** [optional — use the `nx-generate` skill; microservices: `bun nx generate @nx/nest:application --directory=apps/backend/<domain>-service --linter=eslint --name=<domain>-service --tags=<domain>-service --unitTestRunner=jest --useProjectJson=true --no-interactive`]
```

Keep the brief under ~40 lines unless the user asks for depth.

## Priority reference (from PROJECT.md)

1. Authentication → `auth-service`
2. User profiles → `users-service`
3. Trip creation → `trips-service`
4. Trip discovery → `trips-service`
5. Trip membership → `trips-service`
6. Messaging → `messaging-service`
7. Notifications → `notifications-service`

Planned services: `users-service`, `trips-service`, `messaging-service`, `notifications-service`. Shared libs stay in `library/` — do not recommend domain libraries.

## Examples

**User:** "What's next?"
→ Priority 1 near Done → recommend scaffolding `users-service` with first profile endpoints.

**User:** "Compare project detail and repo state"
→ Full status brief + next action item.

**User:** "Should we create a users lib?"
→ No — architecture is microservices; recommend `users-service` + `entities/general/` instead.
