# touring.club

Product vision, domain model, and target architecture for AI agents and contributors.

> **Current repo state:** The codebase is early-stage. Today it ships an `auth-service` with Better Auth, TypeORM, and PostgreSQL. Sections below describe the **target product and architecture**. For what is implemented right now, see [AGENTS.md](../AGENTS.md).

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

The project uses an Nx monorepo.

```
apps/
  api
  web
  mobile

libs/
  auth
  users
  trips
  messaging
  notifications
  storage
  database
  shared

packages/
  ui
  types
  sdk
```

### Backend

|              |                                                                             |
| ------------ | --------------------------------------------------------------------------- |
| Framework    | NestJS                                                                      |
| Language     | TypeScript                                                                  |
| Architecture | Modular monolith, domain-driven modules, REST APIs, WebSockets for realtime |

No GraphQL.

Backend responsibilities:

- Authentication
- Authorization
- Trip management
- Messaging
- Notifications
- User management

### Frontend

| Client | Stack                    |
| ------ | ------------------------ |
| Web    | Next.js, TypeScript      |
| Mobile | React Native, TypeScript |

### Database

Primary database: **PostgreSQL**

PostgreSQL stores:

- Users
- Profiles
- Trips
- Trip memberships
- Conversations
- Messages
- Notifications
- Audit records

PostgreSQL is the source of truth for all business data.

### File Storage

Object storage for media (e.g. AWS S3, Cloudflare R2):

- Profile photos
- Trip photos
- Chat attachments

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
- Keep business logic inside domain services

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
- Migrations for schema changes
- Avoid business logic in database triggers
- Prefer normalized schemas

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

- Assume Nx monorepo
- Assume NestJS backend
- Assume PostgreSQL database
- Assume REST APIs only
- Assume Next.js web frontend and React Native mobile frontend (when building clients)
- Follow modular monolith architecture
- Do not introduce GraphQL
- Do not introduce microservices unless explicitly requested
- Prefer maintainability over optimization
- Keep domain boundaries clear
- Reuse shared libraries whenever possible
- Generate production-ready TypeScript code
- **Match the patterns already in this repository** unless the user explicitly asks to migrate (e.g. existing code uses TypeORM and `@tc/*` libraries under `library/` — see [AGENTS.md](../AGENTS.md))
