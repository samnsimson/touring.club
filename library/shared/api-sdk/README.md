# api-sdk

This library was generated with [Nx](https://nx.dev).

`@tc/api-sdk` holds the raw `hey-api`-generated SDK (types, fetch client, function-based operations, `@tanstack/react-query` hooks) for every backend microservice. It is not meant to be imported directly by apps — see `@tc/server-api` (backend interservice calls) and `@tc/client-api` (frontend, routed through Kong) for the consumer-facing wrappers.

## Building

Run `nx build api-sdk` to build the library.

## Regenerating the SDK

Run `nx run api-sdk:sdk:generate` (or `bun run api:generate` from the repo root, which also regenerates the `server-api`/`client-api` wrappers) after backend OpenAPI specs change.
