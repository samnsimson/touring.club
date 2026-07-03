# Touring Club infrastructure

CI/CD runs on **GitHub Actions** — see `.github/workflows/ci.yml` at the repository root. Postgres and Kong run locally from the root `docker-compose.yml`.

## Layout

```
infra/
├── ci/
│   └── env.ci.example          # CI environment variable template
└── kong/
    └── kong.yml                 # Kong declarative gateway config
.github/
└── workflows/
    └── ci.yml                   # Lint, test, build (nx affected) + deploy hook on main
docker-compose.yml                # Postgres + Kong services
```

## CI pipeline

| Job      | What it does                                                                           |
| -------- | -------------------------------------------------------------------------------------- |
| `ci`     | `bun install` → `nx affected -t lint` → `nx affected -t test` → `nx affected -t build` |
| `deploy` | Placeholder CD job on pushes to `main` — extend with your registry/deployment tooling  |

Affected ranges are computed via [`nrwl/nx-set-shas`](https://github.com/nrwl/nx-set-shas), which diffs against the base branch on pull requests and the previous successful commit on `main`. E2e suites are intentionally out of scope pre-go-live (see root `AGENTS.md`/`CLAUDE.md`), so there is no e2e stage.

## Extending CD

The `deploy` job in `.github/workflows/ci.yml` is intentionally minimal. Typical next steps:

- Add a `Dockerfile` per app and push images from the `deploy` job
- Wire `kubectl`, Helm, or your cloud provider CLI
- Gate production deploys behind a required reviewer (GitHub Environments) or environment branches

## Local services

```bash
docker compose up -d
```

| Service    | Port        | Purpose                    |
| ---------- | ----------- | -------------------------- |
| `postgres` | 5433 (host) | Local development database |
| `kong`     | 8000/8001   | Local API gateway          |

Postgres is published on host port **5433** by default (`POSTGRES_PORT` in `.env`) to avoid clashing with other local Postgres instances on 5432.
