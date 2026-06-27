# @tc/testing

Shared e2e testing utilities for Touring Club apps.

## Exports

- `E2EApi` — supertest wrapper with optional fixture and email capture directories
- `EmailCapture` — read OTP/reset tokens from `EMAIL_PROVIDER=capture` output
- `RequestFixtureLoader` — load `*.request.json` fixtures from disk
- `SnapshotRedactor` — redact dynamic response fields before snapshots

## App layout

```
apps/<app>/__tests__/
├── *.spec.ts              # unit tests (Jest `test` target)
└── e2e/
    ├── *.e2e.spec.ts      # e2e suites — see .cursor/rules/e2e-test-format.mdc
    └── support/           # global setup, auth client helpers
```

## Running auth-service e2e

Requires Postgres (`docker compose up`) and env vars:

```bash
EMAIL_PROVIDER=capture \
EMAIL_CAPTURE_DIR=apps/auth-service/.tmp/e2e-email-capture \
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/touring_club \
BETTER_AUTH_SECRET=local-dev-better-auth-secret-32chars \
bun nx run auth-service:e2e
```
