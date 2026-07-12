# client-api

This library was generated with [Nx](https://nx.dev).

`@tc/client-api` wraps `@tc/api-sdk` for **frontend** calls routed through the Kong gateway. Each generated `configure<Service>Client(options)` (`src/apis/<service>.client-api.ts`, imported via the `@tc/client-api/services/<service>` subpath) points that service's `@hey-api` client at the shared Kong base URL and re-exports its `@tanstack/react-query` hooks and SDK functions/types — call the `configure*` function once at app startup, then import hooks directly from the same subpath.

Supports both cookie-based session auth (`credentials: 'include'`, the default) and header-based auth (pass `auth` — a static token or async callback — which is forwarded as an `Authorization` header), so callers can use either or both depending on the flow.

Only frontend projects may depend on this library (or on `@tc/api-sdk`, which it wraps) — see the `@nx/enforce-module-boundaries` config in the root `eslint.config.mjs`.

## Building

Run `nx build client-api` to build the library.

## Regenerating the per-service clients

Run `nx run client-api:api:generate` (or `bun run api:generate` from the repo root) after `@tc/api-sdk` regenerates.

## Running unit tests

Run `nx test client-api` to execute the unit tests via [Jest](https://jestjs.io).
