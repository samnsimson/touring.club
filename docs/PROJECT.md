# touring.club

Product vision, domain model, and target architecture for AI agents and contributors.

> **Current repo state:** The codebase is early-stage. Today it ships `auth-service`, `users-service`, `trips-service`, `messaging-service`, and `notifications-service` with Better Auth, TypeORM, and PostgreSQL. Sections below describe the **target product and architecture**. For what is implemented right now, see [AGENTS.md](../AGENTS.md).

---

## Overview

touring.club is a social travel and touring platform that helps people discover, organize, and join group trips, local experiences, road trips, sightseeing tours, hiking adventures, and community-driven travel events.

The platform combines travel discovery, event management, community building, and real-time communication into a single application.

Users can:

- Discover trips created by other travelers
- Create and manage their own trips
- Join public or private tours
- Coordinate with participants through messaging
- Share photos and trip updates
- Meet travelers with similar interests
- Build local and destination-based communities

The long-term vision is to become the primary platform for community-driven travel experiences.

---

## Product Goals

The platform should enable:

- Trip discovery
- Trip planning
- Trip coordination
- Community building
- Real-time communication
- Safe and trusted traveler interactions

The product is focused on experiences and communities rather than hotel or flight booking.

---

## Primary User Types

### Travelers

Users who:

- Browse trips
- Join tours
- Meet other travelers
- Participate in group activities

### Organizers

Users who:

- Create trips
- Manage participants
- Coordinate itineraries
- Communicate with members

### Administrators

Users who:

- Moderate content
- Manage reports
- Handle platform operations

---

## Core Features

### Authentication

Users can:

- Register
- Login
- Logout
- Reset password
- Verify email
- Manage account settings

### User Profiles

Users can:

- Upload profile photo
- Add biography
- Select interests
- View travel history
- Manage privacy settings

Profile interest examples:

- Hiking
- Road Trips
- National Parks
- Photography
- Food Tours
- Adventure Travel

### Trips

Users can:

- Create trips
- Edit trips
- Publish trips
- Cancel trips
- Archive trips

Trip properties:

- Title
- Description
- Destination
- Meeting Location
- Start Date
- End Date
- Capacity
- Visibility
- Cover Images
- Categories
- Tags

### Trip Discovery

Users can:

- Browse trips
- Search trips
- Filter trips
- Explore destinations
- View upcoming events

Search criteria:

- Destination
- Date
- Category
- Activity Type
- Distance

### Trip Membership

Users can:

- Join a trip
- Request access
- Leave a trip

Organizers can:

- Approve requests
- Reject requests
- Remove participants
- Manage membership settings

### Messaging

Messaging is a core feature.

#### Direct Messaging

One-to-one conversations between users.

#### Trip Group Chat

Every trip can have an associated group conversation.

Participants can:

- Send messages
- Share photos
- Share trip updates

Message types:

- Text
- Image
- File
- System Event

Examples of system events:

- User joined trip
- User left trip
- Organizer updated itinerary
- Trip was cancelled

Messages are stored in PostgreSQL. PostgreSQL is the source of truth for all messaging data.

### Notifications

Users receive notifications for:

- Join requests
- Trip approvals
- New messages
- Trip updates
- Organizer announcements

Delivery channels:

- In-app
- Push Notifications
- Email (future)

---

## Technical Architecture

### Repository Structure (target)

The project uses an **Nx monorepo** with a **microservices backend**: one deployable NestJS service per domain. Shared infrastructure lives in `library/backend/`; domain logic lives in `apps/backend/<domain>-service/`. Backend and frontend each get their own top-level subfolder under `apps/` and `library/`, and each frontend client app is its own folder under `apps/frontend/` (mirroring `apps/backend/<domain>-service/`) — this keeps the platform boundary visible in the folder tree, not just enforced by lint config.

```
apps/
  backend/                      # One NestJS microservice per domain
    auth-service                 # Authentication (implemented)
    users-service                # User profiles — GET/PATCH me, travel history, public profile
    trips-service                # Trip creation, discovery, membership
    messaging-service            # Direct and trip group chat
    notifications-service        # In-app and push notifications
  frontend/                      # One client app per platform
    web                            # Next.js, App Router — scaffolded shell (Nx-generated, no product pages yet)
    mobile                         # React Native (future)

library/
  backend/                       # Shared infrastructure consumed by all backend services
    auth                         # Better Auth config, guards, adapter (not a domain service)
    config                       # Env schema, ConfigModule
    core                         # Bootstrap, Swagger, health routes
    database                     # TypeORM module, entities, migrations
    utils                        # Cross-cutting utilities
    common                       # HTTP client (axios) and S3 object storage (StorageModule/StorageService)
  frontend                        # Web + mobile UI/state, nothing backend-aware (future)
  shared                          # Contracts shared by backend and frontend — types, API client/SDK (future)

packages/                      # Client packages (future, may fold into library/shared instead)
  ui
  types
  sdk
```

Do **not** create domain libraries (e.g. `library/backend/users`, `library/backend/trips`). Each domain is a **service** under `apps/backend/`.

### Backend

|              |                                                                                |
| ------------ | ------------------------------------------------------------------------------ |
| Framework    | NestJS                                                                         |
| Language     | TypeScript                                                                     |
| Architecture | **Microservices** — one service per domain, REST APIs, WebSockets for realtime |
| Deployment   | Each service is independently deployable and scalable                          |

No GraphQL.

| Service                 | Domain responsibility                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth-service`          | Sign-up, sign-in, sessions, password, email                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `trips-service`         | Trip creation + discovery + membership — organizer CRUD/lifecycle; public discovery; join/leave; organizer approve/reject/remove; `POST /api/v1/trips/:tripId/cover-image` (multipart upload to S3 via `@tc/common` `StorageService`); `GET /api/v1/trips/users/:userId/travel-history` for profile travel history                                                                                                                                                                                                                                            |
| `users-service`         | Profiles, interests, privacy, avatar URL, travel history — `GET/PATCH /api/v1/profiles/me`, `POST /api/v1/profiles/me/avatar` (multipart upload to S3 via `@tc/common` `StorageService`), `GET /api/v1/profiles/me/travel-history` (via `trips-service`), `GET /api/v1/profiles/:userId`                                                                                                                                                                                                                                                                      |
| `messaging-service`     | Direct and trip group chat — `POST/GET /api/v1/conversations`, `POST/GET /api/v1/conversations/:id/messages`, `POST /api/v1/conversations/:id/messages/attachment` (multipart upload to S3 via `@tc/common` `StorageService`), `GET /api/v1/conversations/trips/:tripId`, `GET/POST /api/v1/conversations/trips/:tripId/messages`, `POST /api/v1/conversations/trips/:tripId/messages/attachment`; live delivery via `/conversations` WebSocket namespace — client emits `conversations:join` to authenticate and join its rooms, then receives `message:new` |
| `notifications-service` | In-app notifications — `GET /api/v1/notifications`, `PATCH /api/v1/notifications/:id/read`, internal `POST /api/v1/notifications/internal` (called by `trips-service` and `messaging-service`); live delivery via `/notifications` WebSocket namespace — client emits `notifications:join`, then receives `notification:created`; push delivery planned                                                                                                                                                                                                       |

Services communicate over HTTP (and WebSockets where needed) — e.g. `trips-service`/`messaging-service` call `notifications-service`'s internal create endpoint over HTTP via a `NotificationsClient`. Shared auth validation uses `@tc/auth` guards and JWT/bearer tokens issued by `auth-service`. WebSocket gateways authenticate via a guarded `@SubscribeMessage()` "join" handler (`@UseGuards(WsAuthGuard)` from `@tc/auth`, reusing the same `verifyAuthToken` as the HTTP `AuthGuard`) — guards do not run for the `handleConnection` lifecycle hook in NestJS, only around `@SubscribeMessage()` handlers, so auth must happen there.

### Frontend

| Client | Stack                    | Status                                                                                                         |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Web    | Next.js, TypeScript      | Scaffolded — `apps/frontend/web` (`@nx/next:app`, App Router, tag `scope:frontend`), default starter page only |
| Mobile | React Native, TypeScript | Not started                                                                                                    |

### Database

Primary database: **PostgreSQL** (single database, schema-separated by domain)

PostgreSQL stores:

- Users, sessions, accounts (auth schema)
- Profiles and user-domain data (general schema)
- Trips, memberships (general schema)
- Conversations, messages (general schema)
- Notifications (general schema)
- Audit records

PostgreSQL is the source of truth for all business data.

#### Entity layout

All TypeORM entities live in `@tc/database` under `library/backend/database/src/entities/`, organized by **PostgreSQL schema**:

| Path                           | PostgreSQL schema | Owner                        | Notes                                                                                            |
| ------------------------------ | ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `entities/auth/<Entity>.ts`    | `auth`            | `auth-service` / Better Auth | Regenerated via `auth:generate` (entities only); schema changes via TypeORM `migration:generate` |
| `entities/general/<Entity>.ts` | `general`         | All other services           | Hand-written entities for users, trips, messaging, notifications, etc.                           |

Example entity decorator for non-auth domains:

```typescript
@Entity({ schema: 'general', name: 'profiles' })
export class Profile {
    /* … */
}
```

Migrations live in `library/backend/database/src/migrations/` and are shared across all services.

#### Repository pattern

- **`BaseRepository<Entity>`** in `@tc/database` — abstract TypeORM `Repository` wrapper for NestJS DI
- **Service repositories** in `apps/backend/<service>/src/app/repositories/` — extend `BaseRepository`, add domain queries
- Inject via `@InjectDataSource()`; import `DataSource` types from `@tc/database` (apps must not depend on `typeorm` directly)
- Register repositories in the service module; services inject repositories, not `@InjectRepository()`

Reference: `apps/backend/users-service/src/app/repositories/profile.repository.ts`

### File Storage

Object storage for media via AWS S3 (`@aws-sdk/client-s3`), wrapped by `StorageModule`/`StorageService` in `@tc/common` and registered globally through `@tc/core`'s `RootModule` (same pattern as `HttpModule`). S3-compatible providers (e.g. Cloudflare R2) are supported via `AWS_S3_ENDPOINT`.

- Profile photos — implemented: `POST /api/v1/profiles/me/avatar` (`users-service`) uploads via `StorageService.upload()` and stores the resulting URL on `Profile.avatarUrl`
- Trip cover photos — implemented: `POST /api/v1/trips/:tripId/cover-image` (`trips-service`, organizer-only, editable trips only) uploads via `StorageService.upload()` and appends the URL to `Trip.coverImageUrls` (max 10 per trip)
- Chat attachments — implemented: `POST /api/v1/conversations/:conversationId/messages/attachment` and `POST /api/v1/conversations/trips/:tripId/messages/attachment` (`messaging-service`, participant-only) upload via `StorageService.upload()` and create a `Message` with `messageType: 'image'` (PNG/JPEG/WebP) or `'file'` (PDF/plain text), `body` holding the S3 URL; broadcast over the `/conversations` WebSocket gateway like text messages

Only metadata and URLs are stored in PostgreSQL.

### Realtime Communication

- NestJS WebSockets

Used for:

- Chat
- Notifications
- Presence
- Typing indicators

### Caching (future)

Redis may be introduced for:

- Session storage
- Message caching
- Presence tracking
- Rate limiting

PostgreSQL remains the source of truth.

---

## Domain Model

### User

Represents a platform member.

Responsibilities:

- Authentication
- Profile management
- Trip participation
- Messaging

### Trip

Represents a travel experience.

Responsibilities:

- Scheduling
- Membership
- Itinerary
- Communication

### Conversation

Represents a communication channel.

Types:

- Direct
- Group
- Trip

### Message

Represents a chat message.

Belongs to:

- Conversation
- Sender

Supports:

- Text
- Images
- Files
- System events

---

## Development Principles

### General

- Favor simplicity over complexity
- Avoid premature optimization
- Build maintainable systems
- Prefer explicit code over clever abstractions
- Keep business logic inside the owning microservice (`apps/backend/<domain>-service/`)

### Backend Standards

- TypeScript strict mode
- NestJS dependency injection
- Validate all request DTOs
- OpenAPI / Swagger documentation
- Keep controllers thin; business logic in services
- Feature-based modules

### Database Standards

- PostgreSQL is the source of truth
- UUIDs for primary keys
- Migrations for schema changes (committed in `@tc/database`)
- Avoid business logic in database triggers
- Prefer normalized schemas
- Auth tables in PostgreSQL schema `auth`; all other domain tables in schema `general`
- Entity files mirror schema: `entities/auth/` and `entities/general/`
- Domain data access uses `BaseRepository` subclasses in each microservice (see Repository pattern above)

### API Standards

- REST APIs only
- JSON request/response format
- Consistent error handling
- Version APIs when necessary
- Document all endpoints with Swagger

---

## Current Development Priorities

1. Authentication
2. User profiles
3. Trip creation
4. Trip discovery
5. Trip membership
6. Messaging
7. Notifications

All architectural decisions should support both web and mobile clients.

---

## Instructions for AI Agents

When generating code:

- Assume Nx monorepo with **one microservice per domain** under `apps/backend/<domain>-service/`
- Assume shared infrastructure in `library/` (`@tc/config`, `@tc/core`, `@tc/database`, `@tc/auth`, `@tc/utils`)
- Assume NestJS backend per service
- Assume PostgreSQL with schema-separated entities (`auth` and `general`)
- Assume REST APIs only
- Assume Next.js web frontend and React Native mobile frontend (when building clients)
- Do not introduce GraphQL
- Do not create domain libraries — new domains get a new **service**, not `library/<domain>`
- Use `BaseRepository` in each service for database access; see Database → Repository pattern
- **Keep documentation in sync** — when implementing features, endpoints, services, entities, env vars, or patterns, update `docs/PROJECT.md`, `AGENTS.md`, and related skills in the **same change** (invoke `docs-sync` skill)
- Prefer maintainability over optimization
- Keep service boundaries clear; do not put one domain's business logic in another service's app
- Reuse shared libraries for cross-cutting concerns only
- Generate production-ready TypeScript code
- **Match the patterns already in this repository** (TypeORM, `@tc/*` libraries, `auth-service` as reference — see [AGENTS.md](../AGENTS.md))
