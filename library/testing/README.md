# @tc/testing

Shared e2e testing utilities for Touring Club apps.

## Exports

- `E2EApplication` — bootstraps a Nest app in-process via `Test.createTestingModule`
- `E2EApi` — supertest wrapper with optional fixture directories
- `MockEmailService` — in-memory Jest mock for OTP/reset-token e2e flows
- `RequestFixtureLoader` — load `*.request.json` fixtures from disk
- `SnapshotRedactor` — redact dynamic response fields before snapshots

## App layout

```
apps/<app>/__tests__/
├── unit/
│   └── *.spec.ts          # unit tests (Jest `test` target)
└── e2e/
    ├── *.e2e.spec.ts      # e2e suites — see .cursor/rules/e2e-test-format.mdc
    └── support/           # global setup, scenario helpers
```

## Running auth-service e2e

Requires Postgres (`docker compose up`) and env vars:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/touring_club \
BETTER_AUTH_SECRET=local-dev-better-auth-secret-32chars \
bun nx run auth-service:e2e
```
