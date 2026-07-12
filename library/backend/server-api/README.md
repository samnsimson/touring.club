# server-api

This library was generated with [Nx](https://nx.dev).

`@tc/server-api` wraps `@tc/api-sdk` for **backend-to-backend** calls that bypass Kong — each generated `<Service>Api` class (`src/apis/<service>.server-api.ts`) is constructed with the target service's own base URL and forwards the caller's `Authorization` header per call, matching the interservice pattern documented in `CLAUDE.md`.

Only backend projects may depend on this library (or on `@tc/api-sdk`, which it wraps) — see the `@nx/enforce-module-boundaries` config in the root `eslint.config.mjs`. Import a service's response/request types via the `@tc/server-api/services/<service>` subpath (e.g. `import type { TravelHistoryResponseDto } from '@tc/server-api/services/trips-service';`) — the root barrel only re-exports the `<Service>Api` classes to avoid cross-service type name collisions (same reason `@tc/api-sdk` restricts type access to its own `./clients/*` subpath).

## Building

Run `nx build server-api` to build the library.

## Regenerating the wrapper classes

Run `nx run server-api:api:generate` (or `bun run api:generate` from the repo root) after `@tc/api-sdk` regenerates.

## Running unit tests

Run `nx test server-api` to execute the unit tests via [Jest](https://jestjs.io).
