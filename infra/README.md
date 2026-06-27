# Touring Club infrastructure

Local CI/CD is powered by Jenkins (Docker) and an Nx-aware `Jenkinsfile` at the repository root. Jenkins and Postgres both run from the root `docker-compose.yml`.

## Layout

```
infra/
├── ci/
│   └── env.ci.example          # CI environment variable template
├── docker/
│   └── ci-agent/
│       └── Dockerfile          # Bun-based Jenkins pipeline agent
└── jenkins/
    ├── casc/
    │   └── jenkins.yaml        # Jenkins Configuration as Code
    ├── scripts/
    │   ├── up.sh               # Start Jenkins (and Postgres if needed)
    │   └── down.sh             # Stop Jenkins
    ├── Dockerfile
    ├── plugins.txt
    └── .env.example
Jenkinsfile                       # Multibranch pipeline (lint, test, build, e2e, deploy hook)
docker-compose.yml                # Postgres + Jenkins services
```

## Quick start

1. Start Postgres and Jenkins:

    ```bash
    chmod +x infra/jenkins/scripts/*.sh
    ./infra/jenkins/scripts/up.sh
    ```

    Or start everything manually from the repo root:

    ```bash
    docker compose up -d
    ```

2. Open [http://localhost:8080](http://localhost:8080) and sign in:
    - User: `admin`
    - Password: value of `JENKINS_ADMIN_PASSWORD` in `infra/jenkins/.env` (default `admin`)

3. Create a **Multibranch Pipeline** job (see step 4 below).

4. Create a **Multibranch Pipeline** job named `touring-club`:
    - **Branch Sources** → Git → set your repository URL
    - **Behaviours** → Discover branches
    - **Build Configuration** → Mode: by Jenkinsfile → Script Path: `Jenkinsfile`
    - Save and **Scan Repository Now**

## Pipeline stages

| Stage   | What it does                                                                         |
| ------- | ------------------------------------------------------------------------------------ |
| Install | `bun install --frozen-lockfile`                                                      |
| Lint    | `nx affected -t lint` (falls back to `run-many` on first build)                      |
| Test    | `nx affected -t test`                                                                |
| Build   | `nx affected -t build`                                                               |
| E2E     | Runs `auth-service-e2e` when `auth-service` is affected; applies DB migrations first |
| Deploy  | Placeholder CD stage on `main` — extend with your registry/deployment tooling        |

The pipeline agent image is built from `infra/docker/ci-agent/Dockerfile` (Bun + Git + Docker CLI). It joins the `touring-club` Docker network so builds can reach the shared Postgres service.

## Credentials

JCasC seeds two string credentials used by the pipeline:

| Credential ID                     | Purpose                                    |
| --------------------------------- | ------------------------------------------ |
| `touring-club-better-auth-secret` | `BETTER_AUTH_SECRET` for app startup in CI |
| `touring-club-database-url`       | `DATABASE_URL` for migrations and e2e      |

Override defaults in `infra/jenkins/.env` before starting Jenkins. For production, replace these with Jenkins credential store entries or a secrets manager integration.

## Services

| Service    | Port        | Purpose                           |
| ---------- | ----------- | --------------------------------- |
| `postgres` | 5433 (host) | Local development and CI database |
| `jenkins`  | 8080        | CI/CD server                      |

Both services share the `touring-club` Docker network. Postgres is published on host port **5433** by default (`POSTGRES_PORT` in `.env`) to avoid clashing with other local Postgres instances on 5432.

## Extending CD

The `Deploy` stage in `Jenkinsfile` is intentionally minimal. Typical next steps:

- Add a `Dockerfile` per app and push images from the `Deploy` stage
- Wire `kubectl`, Helm, or your cloud provider CLI
- Gate production deploys behind manual approval (`input` step) or environment branches

## Shut down

Stop Jenkins only (Postgres keeps running for local dev):

```bash
./infra/jenkins/scripts/down.sh
```

Stop all services:

```bash
docker compose down
```
