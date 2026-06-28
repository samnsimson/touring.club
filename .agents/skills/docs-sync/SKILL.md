---
name: docs-sync
description: Determines which markdown and agent docs to update when code changes land. USE WHEN implementing a new feature, endpoint, microservice, entity, env var, or architectural pattern — or when the user asks which docs to update after a change.
---

# Documentation Sync

When you add or change **behavior** (features, endpoints, services, entities, env vars, patterns), update the related markdown in the **same change**. Do not ship code with stale docs.

## When to run

Run this checklist before finishing any task that:

- Adds or modifies API endpoints
- Scaffolds a new microservice or shared library
- Adds entities, migrations, or repositories
- Introduces env vars, ports, or config
- Establishes a new code pattern agents should follow
- Completes or starts a development priority from `docs/PROJECT.md`

## Checklist

| If you changed…              | Update these files                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| New microservice             | [AGENTS.md](../../AGENTS.md) (Current Projects, layout tree), [docs/PROJECT.md](../../docs/PROJECT.md) (services table, repo structure)          |
| New API routes               | [docs/PROJECT.md](../../docs/PROJECT.md) (feature/service description), Bruno collection under `apps/<service>/bruno/` if the service uses Bruno |
| New entity / migration       | [docs/PROJECT.md](../../docs/PROJECT.md) (entity layout), [AGENTS.md](../../AGENTS.md) if new schema/path conventions                            |
| New env var / port           | `library/config/src/lib/env.schema.ts` (required first), [AGENTS.md](../../AGENTS.md) if documenting service ports                               |
| New shared pattern           | [AGENTS.md](../../AGENTS.md), [CLAUDE.md](../../CLAUDE.md), relevant `.agents/skills/*.md`                                                       |
| Roadmap / priority progress  | [docs/PROJECT.md](../../docs/PROJECT.md), [.agents/skills/project-status/SKILL.md](../project-status/SKILL.md)                                   |
| Unit test conventions        | [AGENTS.md](../../AGENTS.md) Coding Standards — all tests under `__tests__/unit/` (e2e is out of scope pre-go-live, see Testing scope note)      |
| Generator / scaffold command | [.agents/skills/nx-generate/SKILL.md](../nx-generate/SKILL.md), [AGENTS.md](../../AGENTS.md)                                                     |

## Repository pattern (reference)

When adding DB access to a service, document is already in AGENTS.md — ensure new services follow:

- Entity in `library/database/src/entities/general/`
- Repository in `apps/<service>/src/app/repositories/` extending `BaseRepository`
- `@InjectDataSource()` + `DataSource` type from `@tc/database`
- No direct `typeorm` dependency in app `package.json`

## Rules

1. **Same change** — doc updates belong in the same PR/commit series as the code, not a follow-up task
2. **Minimal but accurate** — update what changed; do not rewrite unrelated sections
3. **Both agent entry points** — if you update [AGENTS.md](../../AGENTS.md), mirror the same facts in [CLAUDE.md](../../CLAUDE.md) (they should stay aligned)
4. **Skills for repeatable workflows** — if agents repeatedly need the same guidance, add or extend a skill under `.agents/skills/`

## Quick verification

Before marking a task done, confirm:

- [ ] `docs/PROJECT.md` reflects new services/features if user-facing scope changed
- [ ] `AGENTS.md` / `CLAUDE.md` list current projects and patterns correctly
- [ ] Any new env vars are in `EnvSchema`
- [ ] Relevant skill files updated if workflow changed
