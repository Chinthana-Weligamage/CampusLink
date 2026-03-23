# SLIIT CampusLink (Malabe) — `PLAN.md`

> **Project type:** Microservices MVP backend for IT4020 Assignment 2  
> **Stack:** Node.js 24.x, Express, Express Gateway, SQLite, Swagger/OpenAPI  
> **Architecture style:** Monorepo with 4 business microservices + 1 API gateway  
> **Timeline covered by this plan:** 23 March 2026 to 28 March 2026  
> **Time zone for all timestamps and Git dates:** `Asia/Colombo` (`UTC+05:30`)

---

## 1. Project identity

### 1.1 Overall system name
**SLIIT CampusLink (Malabe)**

### 1.2 One-line description
A microservices-based campus operations platform for **SLIIT Uni, Malabe** students that supports **student accounts, shuttle transport, assignment workflows, and real-time notifications** through a single API gateway.

### 1.3 Why this name works
- **CampusLink** communicates that the system connects multiple student-facing services.
- It fits a **university context** better than a generic “management system”.
- It naturally supports future expansion beyond the 4 MVP services.

### 1.4 Assignment-fit statement
This plan is intentionally optimized to satisfy and exceed the assignment expectations:
- **one microservice per group member**
- **API gateway to avoid exposing multiple service ports**
- **proper folder structure with gateway + microservices**
- **native Swagger docs and the same docs via gateway**
- **direct endpoint access + gateway access**
- **clear contribution ownership per team member**
- **industry-style final artifact quality**
- **no build breaks / no runtime errors**
- **strong documentation for later slide-deck preparation**

---

## 2. Team ownership and service map

| Component | Owner | Email | Port | Gateway Prefix | DB File | Branch Prefix |
|---|---|---|---:|---|---|---|
| Project init + housekeeping + gateway | Chinthana-Weligamage | chinthanaweligamage1@gmail.com | 8080 | N/A | N/A | `chinthana/` |
| User Service | ImeshaNadeeshani | imeshanadeeshani761@gmail.com | 3001 | `/user` | `services/user-service/data/user.sqlite` | `imesha/` |
| Transport Service | DilmaniKiriella | dilmanikiriella@gmail.com | 3002 | `/transport` | `services/transport-service/data/transport.sqlite` | `dilmani/` |
| Assignment Service | Devram-ts | devramsaparamadu@gmail.com | 3003 | `/assignment` | `services/assignment-service/data/assignment.sqlite` | `devram/` |
| Notification Service | Chinthana-Weligamage | chinthanaweligamage1@gmail.com | 3004 | `/notification` | `services/notification-service/data/notification.sqlite` | `chinthana/` |

### 2.1 Ownership rules
- **Chinthana** owns:
  - repository bootstrap
  - root workspace setup
  - `.gitignore`, `.editorconfig`, lint/format hooks
  - `gateway/`
  - `packages/shared/`
  - `scripts/`
  - `docs/` skeleton and final docs consolidation
  - Notification Service
- **Each service owner** owns:
  - their service directory
  - their service tests
  - their service OpenAPI/Swagger definitions
  - their component-specific docs under `docs/slides/`
  - their feature branches and their service-specific merge commits

### 2.2 Critical contribution rule
To maximize marks for individual contribution visibility:
- each component owner must make the commits for their own component
- each component owner must have their **own feature branches**
- each component owner must merge their **own component feature branches** into `develop`
- gateway/root/shared/housekeeping changes should be authored by **Chinthana**
- if a component needs a shared change, coordinate with Chinthana first

---

## 3. MVP functional scope

### 3.1 Included in MVP
1. **User Service**
   - student registration
   - login
   - JWT authentication
   - profile view/update
   - user lookup for internal integrations

2. **Transport Shuttle Service**
   - shuttle route listing
   - schedule listing
   - seat booking
   - booking cancellation
   - delay/announcement support for notifications

3. **Assignment Service**
   - module assignments listing
   - assignment creation (admin)
   - student submission recording
   - submission history lookup

4. **Notification Service**
   - store notifications
   - notification preferences
   - read/unread updates
   - **real-time sync using Server-Sent Events (SSE)**
   - internal event ingestion from other services

5. **API Gateway**
   - single public entry point
   - route requests to all services
   - make service Swagger docs reachable via gateway
   - optional base policies: CORS, logging, rate limiting

### 3.2 Explicitly out of scope
Do **not** add these unless everything else is already stable:
- frontend UI
- file uploads for assignments
- payment flows
- attendance tracking
- map/geo live bus tracking
- email/SMS providers
- Docker/Kubernetes (nice-to-have, not required for MVP)
- service discovery / message broker / Redis

### 3.3 Realistic demo scenario
Use one end-to-end story during system testing:
1. Student registers and logs in through User Service.
2. Student books a seat on a SLIIT Malabe shuttle route.
3. Transport Service emits an event to Notification Service.
4. Student receives a real-time notification through SSE.
5. Student views assignments and submits one.
6. Assignment Service emits an event to Notification Service.
7. Student receives a second real-time notification.
8. All of the above must work **directly** and **through the gateway** where applicable.

---

## 4. Technical baseline and pinned decisions

### 4.1 Runtime and package management
- **Node.js:** pin the team to **Node 24.x LTS**
- **Package manager:** `npm`
- **Monorepo:** use **npm workspaces**
- **Module system:** use **CommonJS** consistently across services and gateway to reduce friction

### 4.2 API layer
- **Framework:** Express
- **Validation:** `zod`
- **Security basics:** `helmet`, `cors`, JWT, bcrypt
- **Logging:** `pino` / `pino-http` or a consistent minimal structured logger
- **Testing:** Node built-in test runner + `supertest`

### 4.3 Database layer
- **Database engine:** SQLite
- **Node access method:** use **Node 24 `node:sqlite`** as the primary plan
- **Why:** fewer third-party moving parts, aligned with official Node docs, simple local setup

### 4.4 Documentation
- **Spec format:** OpenAPI **3.0.4**
- **Interactive docs:** Swagger UI
- **Per service endpoints:**
  - `GET /docs`
  - `GET /openapi.json`

### 4.5 Real-time design
- **Notification Service only** gets real-time behavior
- Use **Server-Sent Events (SSE)** instead of WebSocket for MVP simplicity and reliability
- Keep other services request/response only

### 4.6 Non-negotiable architecture rules
- each microservice has **its own SQLite DB**
- do **not** share database files across services
- do **not** collapse business logic into the gateway
- do **not** let route files directly contain SQL
- do **not** introduce a frontend before backend stabilizes
- do **not** use copy-pasted tutorial boilerplate blindly; adapt everything to this domain

---

## 5. High-level architecture

```text
Client / Postman / curl
        |
        v
+----------------------+
|   Express Gateway    |  :8080
|  /user/*             |
|  /transport/*        |
|  /assignment/*       |
|  /notification/*     |
+----------------------+
   |        |        |        |
   v        v        v        v
 User    Transport Assignment Notification
:3001     :3002      :3003      :3004
  |          |          |          |
  v          v          v          v
user.sqlite transport.sqlite assignment.sqlite notification.sqlite
```

### 5.1 Inter-service connectivity model
Use a mixed approach:

#### Synchronous
- Client requests go through gateway to services.
- Services verify JWT locally.
- Notification Service may call User Service **only if** it needs profile enrichment.
- Assignment and Transport services may call User Service for internal lookup endpoints when needed.

#### Asynchronous-ish over HTTP (simple MVP version)
Use **event push over HTTP** to the Notification Service:
- User Service → Notification Service
- Transport Service → Notification Service
- Assignment Service → Notification Service

This avoids adding RabbitMQ/Kafka while still demonstrating service interconnectivity.

### 5.2 Internal event transport
Each producing service will call:

```http
POST http://localhost:3004/internal/events
Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
Content-Type: application/json
```

With payload shape:

```json
{
  "eventType": "transport.booking.created",
  "sourceService": "transport-service",
  "userId": "USR-123",
  "title": "Shuttle booking confirmed",
  "message": "Your 7:30 AM shuttle booking to SLIIT Malabe is confirmed.",
  "payload": {
    "bookingId": "BKG-001",
    "scheduleId": "SCH-001"
  },
  "occurredAt": "2026-03-26T11:30:00+05:30"
}
```

---

## 6. Monorepo folder structure

```text
sliit-campuslink/
├─ .editorconfig
├─ .gitignore
├─ .nvmrc
├─ package.json
├─ package-lock.json
├─ README.md
├─ docs/
│  ├─ PLAN.md
│  ├─ ARCHITECTURE.md
│  ├─ API_CATALOG.md
│  ├─ TEAM_CONTRIBUTIONS.md
│  ├─ SCREENSHOT_CHECKLIST.md
│  ├─ DEMO_SCRIPT.md
│  ├─ contracts/
│  │  └─ notification-event-contract.md
│  └─ slides/
│     ├─ 01-domain-and-scope.md
│     ├─ 02-user-service.md
│     ├─ 03-transport-service.md
│     ├─ 04-assignment-service.md
│     ├─ 05-notification-service.md
│     ├─ 06-api-gateway.md
│     └─ 07-team-contributions.md
├─ gateway/
│  ├─ package.json
│  ├─ server.js
│  └─ config/
│     ├─ gateway.config.yml
│     ├─ system.config.yml
│     └─ models/
├─ packages/
│  └─ shared/
│     ├─ package.json
│     └─ src/
│        ├─ env.js
│        ├─ logger.js
│        ├─ response.js
│        ├─ request-id.js
│        └─ internal-http.js
├─ scripts/
│  ├─ dev-all.mjs
│  ├─ smoke-test.mjs
│  └─ verify-docs.mjs
└─ services/
   ├─ user-service/
   │  ├─ package.json
   │  ├─ .env.example
   │  ├─ src/
   │  │  ├─ app.js
   │  │  ├─ server.js
   │  │  ├─ config/
   │  │  ├─ db/
   │  │  │  ├─ connection.js
   │  │  │  ├─ migrate.js
   │  │  │  └─ seed.js
   │  │  ├─ middlewares/
   │  │  ├─ repositories/
   │  │  ├─ services/
   │  │  ├─ controllers/
   │  │  ├─ routes/
   │  │  ├─ schemas/
   │  │  ├─ docs/
   │  │  │  └─ openapi.js
   │  │  └─ utils/
   │  ├─ data/
   │  └─ test/
   ├─ transport-service/
   ├─ assignment-service/
   └─ notification-service/
```

### 6.1 Shared package rule
`packages/shared` may include **only cross-cutting utilities**, such as:
- env loading helpers
- request ID middleware
- common response formatter
- shared internal HTTP caller
- logger helpers

It must **not** include:
- domain entities
- SQL queries
- service-specific repositories
- JWT secrets
- route handlers

---

## 7. Service design details

### 7.1 User Service

### Owner
ImeshaNadeeshani

### Responsibility
System of record for student identity and authentication.

### Core tables
- `users`
- `auth_audit_logs` (optional but recommended)
- `refresh_tokens` (optional for stretch; skip if needed to control scope)

### Suggested `users` columns
- `id` (TEXT PK)
- `studentNo` (TEXT UNIQUE)
- `fullName`
- `email` (SLIIT email format)
- `passwordHash`
- `role` (`student` or `admin`)
- `faculty`
- `specialization`
- `intakeYear`
- `contactNo`
- `defaultPickupStop`
- `createdAt`
- `updatedAt`

### Realistic APIs (minimum 3 required; implement at least 5)
1. `POST /register`
   - create student/admin account
2. `POST /login`
   - return JWT
3. `GET /me`
   - return authenticated user profile
4. `PATCH /me`
   - update profile/contact/pickup stop
5. `GET /students/:studentId`
   - internal/profile lookup endpoint
6. `GET /health`

### Example request ideas
- register payload:
  - `studentNo`
  - `fullName`
  - `email`
  - `password`
  - `faculty`
  - `specialization`
  - `intakeYear`
  - `defaultPickupStop`

### Events emitted to Notification Service
- `user.registered`
- `user.profile.updated`

### Slide-deck notes to preserve during development
Create and update `docs/slides/02-user-service.md` with:
- service purpose
- why it is a separate microservice
- tables
- API list
- auth strategy
- screenshots to capture later

---

### 7.2 Transport Shuttle Service

### Owner
DilmaniKiriella

### Responsibility
Manage shuttle routes, schedules, seat bookings, and transport-related announcements.

### Core tables
- `routes`
- `schedules`
- `bookings`
- `announcements`

### Suggested table responsibilities
- `routes`: route definition
- `schedules`: time-specific route executions and seat capacity
- `bookings`: student seat reservations
- `announcements`: delays/cancellations/messages

### Realistic APIs (minimum 3 required; implement at least 5)
1. `GET /routes`
   - list available routes for SLIIT Malabe
2. `GET /routes/:routeId/schedules`
   - list schedules for a route
3. `POST /bookings`
   - reserve a shuttle seat
4. `GET /users/:userId/bookings`
   - list student bookings
5. `PATCH /bookings/:bookingId/cancel`
   - cancel booking and release seat
6. `POST /announcements`
   - admin posts a delay/cancellation message
7. `GET /health`

### Realistic Malabe seed data examples
- Kottawa → SLIIT Malabe
- Makumbura → SLIIT Malabe
- Kaduwela → SLIIT Malabe
- Battaramulla → SLIIT Malabe

### Important business rules
- no overbooking
- booking insert + seat decrement must happen in one transaction
- cancellation must restore seat count
- announcements may trigger notifications

### Events emitted to Notification Service
- `transport.booking.created`
- `transport.booking.cancelled`
- `transport.announcement.created`

### Slide-deck notes to preserve
Update `docs/slides/03-transport-service.md` with:
- route/schedule/booking model
- transaction safety
- how the service talks to Notification Service
- screenshots to capture later

---

### 7.3 Assignment Service

### Owner
Devram-ts

### Responsibility
Manage assignments relevant to SLIIT Malabe students, plus submission tracking.

### Core tables
- `modules`
- `assignments`
- `submissions`

### Suggested columns
#### `modules`
- `moduleCode`
- `moduleName`
- `semester`
- `academicYear`

#### `assignments`
- `id`
- `moduleCode`
- `title`
- `description`
- `dueAt`
- `createdBy`
- `createdAt`
- `status`

#### `submissions`
- `id`
- `assignmentId`
- `userId`
- `submissionUrl`
- `notes`
- `submittedAt`
- `status`

### Realistic APIs (minimum 3 required; implement at least 5)
1. `GET /modules/:moduleCode/assignments`
   - list assignments for module
2. `GET /assignments/:assignmentId`
   - assignment details
3. `POST /assignments`
   - admin creates assignment
4. `POST /assignments/:assignmentId/submissions`
   - student submits work link / notes
5. `GET /students/:userId/submissions`
   - student submission history
6. `GET /health`

### Realistic Malabe seed data examples
- `IT4020` — Modern Topics in IT
- `SE4030` — Software Engineering Project
- `IE4010` — Enterprise Integration

### Important business rules
- only admin can create assignments
- student cannot submit after due time unless explicitly allowed
- duplicate submissions can either:
  - replace previous one (with versioning), or
  - be rejected after first submission  
  For MVP, choose one policy and document it clearly.
- validate module existence

### Events emitted to Notification Service
- `assignment.created`
- `assignment.submission.recorded`
- `assignment.deadline.reminder` (optional after core stable)

### Slide-deck notes to preserve
Update `docs/slides/04-assignment-service.md` with:
- module-assignment-submission relationship
- validation rules
- notification triggers
- screenshots to capture later

---

### 7.4 Notification Service

### Owner
Chinthana-Weligamage

### Responsibility
Centralized student notification store plus **real-time sync**.

### Core tables
- `notifications`
- `preferences`
- `delivery_logs` (recommended)
- optional `stream_audit` if needed for debug only

### Suggested notification types
- welcome
- transport booking confirmation
- transport cancellation confirmation
- transport delay alert
- assignment created
- assignment submission confirmation
- general system notice

### Realistic APIs (minimum 3 required; implement at least 6)
1. `POST /internal/events`
   - internal event ingestion from other services
2. `GET /users/:userId/notifications`
   - list notifications
3. `PATCH /notifications/:notificationId/read`
   - mark single notification as read
4. `PATCH /users/:userId/notifications/read-all`
   - mark all as read
5. `PUT /users/:userId/preferences`
   - update preference flags
6. `GET /stream`
   - SSE endpoint for real-time notification push
7. `GET /health`

### SSE design
- authenticate request before opening stream
- associate stream with `userId`
- keep in-memory map:
  - `Map<userId, Set<response>>`
- send heartbeat every 25–30 seconds
- on event creation:
  - persist notification first
  - then push SSE event to active client(s)
- on disconnect:
  - remove stream from map
- support missed-message recovery using `GET /users/:userId/notifications`

### Important business rules
- preferences can disable certain categories
- internal event endpoint must require `INTERNAL_SERVICE_TOKEN`
- Notification Service is **not** the owner of user identity; it stores `userId` + message snapshot only
- real-time sync belongs **only** here; do not add live sockets to other services

### Slide-deck notes to preserve
Update `docs/slides/05-notification-service.md` with:
- why real-time belongs here only
- event ingestion flow
- SSE flow
- preference filtering
- screenshots to capture later

---

## 8. Cross-service contracts and interconnectivity

### 8.1 Authentication strategy
### Recommended MVP approach
- User Service issues JWT after login.
- All services verify JWT locally with the same shared secret.
- Gateway forwards the `Authorization` header to downstream services.
- Services do **not** depend on gateway for auth logic.

### Why this is good for the assignment
- keeps gateway focused on routing/policies
- keeps business auth close to services
- demonstrates clean separation
- simpler to test directly and via gateway

### JWT claims
At minimum:
- `sub` → user ID
- `role` → `student` / `admin`
- `email`
- `studentNo`

---

### 8.2 Notification event contract
Store this in `docs/contracts/notification-event-contract.md`.

### Required fields
- `eventType`
- `sourceService`
- `userId`
- `title`
- `message`
- `occurredAt`
- `payload` (object, may be empty)

### Security
- internal event routes must require a shared token:
  - `Authorization: Bearer <INTERNAL_SERVICE_TOKEN>`

### Producers
- User Service
- Transport Service
- Assignment Service

### Consumer
- Notification Service

---

### 8.3 Concrete integration flows

### Flow A — User registration
1. Client calls `POST /user/register` via gateway.
2. Gateway proxies to User Service.
3. User Service stores user.
4. User Service sends `user.registered` to Notification Service.
5. Notification Service stores welcome notification.
6. If stream exists, Notification Service pushes event live.

### Flow B — Shuttle booking
1. Client calls `POST /transport/bookings`.
2. Transport Service validates JWT and seat availability.
3. Transport Service stores booking and decrements seat count in one transaction.
4. Transport Service sends `transport.booking.created`.
5. Notification Service stores + pushes.

### Flow C — Assignment submission
1. Client calls `POST /assignment/assignments/:id/submissions`.
2. Assignment Service validates due date, auth, assignment existence.
3. Assignment Service stores submission.
4. Assignment Service sends `assignment.submission.recorded`.
5. Notification Service stores + pushes.

---

### 8.4 Optional synchronous lookups
Use only if really needed:
- Notification Service → User Service:
  - fetch display name/email for enrichment
- Transport Service → User Service:
  - internal lookup if booking requires profile verification
- Assignment Service → User Service:
  - internal lookup if admin/user checks need it

Prefer using JWT claims and event payload data first to avoid unnecessary tight coupling.

---

## 9. API Gateway design

### 9.1 Fixed ports
- Gateway: `8080`
- User: `3001`
- Transport: `3002`
- Assignment: `3003`
- Notification: `3004`

Keep these ports fixed throughout development to avoid confusion in docs, tests, and screenshots.

### 9.2 Gateway route map

| Public Gateway Path | Downstream Service | Notes |
|---|---|---|
| `/user/*` | User Service | strip `/user` before proxy |
| `/transport/*` | Transport Service | strip `/transport` before proxy |
| `/assignment/*` | Assignment Service | strip `/assignment` before proxy |
| `/notification/*` | Notification Service | strip `/notification` before proxy |

### 9.3 Native vs gateway Swagger URLs
These URLs must work before final freeze:

| Service | Native Swagger URL | Gateway Swagger URL | Native OpenAPI JSON | Gateway OpenAPI JSON |
|---|---|---|---|---|
| User | `http://localhost:3001/docs` | `http://localhost:8080/user/docs` | `http://localhost:3001/openapi.json` | `http://localhost:8080/user/openapi.json` |
| Transport | `http://localhost:3002/docs` | `http://localhost:8080/transport/docs` | `http://localhost:3002/openapi.json` | `http://localhost:8080/transport/openapi.json` |
| Assignment | `http://localhost:3003/docs` | `http://localhost:8080/assignment/docs` | `http://localhost:3003/openapi.json` | `http://localhost:8080/assignment/openapi.json` |
| Notification | `http://localhost:3004/docs` | `http://localhost:8080/notification/docs` | `http://localhost:3004/openapi.json` | `http://localhost:8080/notification/openapi.json` |

### 9.4 Minimum gateway policies
Enable at least:
- `cors`
- `log`
- `proxy`

Recommended if time permits:
- `rate-limiter`

### Do not overcomplicate the gateway
For MVP, avoid:
- OAuth2 in gateway
- complex consumer management
- multiple gateway plugins
- custom gateway auth if service-level JWT is enough

### 9.5 Gateway config expectations
- declare `serviceEndpoints`
- declare `apiEndpoints`
- use `pipelines`
- use `stripPath: true`
- keep `prependPath: false`
- gateway config should be environment-variable friendly

---

## 10. Project initialization instructions (Chinthana only)

> **Owner:** Chinthana-Weligamage  
> **Do this first before other members branch off.**

### 10.1 Prerequisites
Install and verify:
- Node.js 24.x LTS
- npm
- git
- Express Gateway CLI

### Suggested verification
```bash
node -v
npm -v
git --version
eg --help
```

### 10.2 Bootstrap repository
```bash
mkdir sliit-campuslink
cd sliit-campuslink
git init
git checkout -b main
git checkout -b develop
npm init -y
```

### 10.3 Configure root workspace
Edit `package.json` to include:
- `"private": true`
- npm workspaces:
  - `"gateway"`
  - `"services/*"`
  - `"packages/*"`

Then create directories:
```bash
mkdir -p docs/contracts docs/slides
mkdir -p gateway
mkdir -p packages/shared/src
mkdir -p scripts
mkdir -p services/user-service
mkdir -p services/transport-service
mkdir -p services/assignment-service
mkdir -p services/notification-service
```

### 10.4 Add housekeeping files
Create:
- `.gitignore`
- `.editorconfig`
- `.nvmrc`
- `README.md`
- `docs/PLAN.md`

### `.gitignore` must include at least
```gitignore
node_modules/
.env
.env.*
*.sqlite
*.sqlite-shm
*.sqlite-wal
coverage/
logs/
.DS_Store
```

### 10.5 Scaffold gateway using official CLI
Preferred:
```bash
npm install -g express-gateway
eg gateway create -n gateway -d gateway -t getting-started
```

Then:
- set gateway port to `8080`
- simplify the default config
- keep only the policies and endpoints needed for this MVP

### 10.6 Create shared package
Inside `packages/shared/`:
- `env.js`
- `logger.js`
- `response.js`
- `request-id.js`
- `internal-http.js`

### Shared package purpose
- avoid duplicate cross-cutting boilerplate
- keep services consistent
- do not centralize domain logic

### 10.7 Create docs skeleton for later slide deck
Create these now:
- `docs/ARCHITECTURE.md`
- `docs/API_CATALOG.md`
- `docs/TEAM_CONTRIBUTIONS.md`
- `docs/SCREENSHOT_CHECKLIST.md`
- `docs/DEMO_SCRIPT.md`
- `docs/contracts/notification-event-contract.md`
- `docs/slides/01-domain-and-scope.md`
- `docs/slides/02-user-service.md`
- `docs/slides/03-transport-service.md`
- `docs/slides/04-assignment-service.md`
- `docs/slides/05-notification-service.md`
- `docs/slides/06-api-gateway.md`
- `docs/slides/07-team-contributions.md`

### 10.8 Root scripts to provide
At root, plan for:
- `npm run dev:user`
- `npm run dev:transport`
- `npm run dev:assignment`
- `npm run dev:notification`
- `npm run dev:gateway`
- `npm run dev:all`
- `npm run test:all`
- `npm run smoke`
- `npm run lint`

### 10.9 Environment file strategy
Use `.env.example` per service and keep real `.env` out of git.

At minimum define:
- `PORT`
- `JWT_SECRET`
- `INTERNAL_SERVICE_TOKEN`
- service base URLs
- `NODE_ENV`

### Recommended root values
```env
GATEWAY_PORT=8080
USER_SERVICE_PORT=3001
TRANSPORT_SERVICE_PORT=3002
ASSIGNMENT_SERVICE_PORT=3003
NOTIFICATION_SERVICE_PORT=3004
JWT_SECRET=replace_this_for_local_dev
INTERNAL_SERVICE_TOKEN=replace_this_internal_token
```

### 10.10 Service scaffold pattern
Each service should contain:
- `src/app.js`
- `src/server.js`
- `src/db/connection.js`
- `src/db/migrate.js`
- `src/db/seed.js`
- `src/routes/`
- `src/controllers/`
- `src/services/`
- `src/repositories/`
- `src/schemas/`
- `src/docs/openapi.js`
- `test/`

---

## 11. Git workflow, identity rules, and commit discipline

### 11.1 Branch strategy
Use this branch model:
- `main` → stable demo-ready branch only
- `develop` → integration branch
- feature branches → one branch per feature

### Naming convention
```text
<owner-prefix>/<type>/<short-feature-name>
```

Examples:
- `chinthana/chore/repo-bootstrap`
- `chinthana/feat/gateway-routing`
- `imesha/feat/user-auth-profile`
- `dilmani/feat/transport-bookings`
- `devram/feat/assignment-submissions`
- `chinthana/feat/notification-realtime-sse`

### 11.2 Merge strategy
Use:
```bash
git merge --no-ff <feature-branch>
```

Why:
- preserves branch history
- keeps contribution boundaries visible
- better for assignment evaluation

### Rule
Do **not** squash feature branches if it would erase visible contribution granularity.

### 11.3 Commit after each logical step
Every step in this plan ends with:
1. `git add`
2. `git commit`
3. test / smoke check
4. merge into `develop`

Do not wait multiple days to make one giant commit.

### 11.4 Conventional commit style
Use this style:
- `chore(...)`
- `feat(...)`
- `fix(...)`
- `docs(...)`
- `test(...)`
- `refactor(...)`

Examples:
- `chore(repo): initialize monorepo workspace and housekeeping`
- `feat(user): add registration login and profile endpoints`
- `feat(transport): implement schedules and booking flow`
- `feat(notification): add SSE real-time stream`
- `docs(slides): add transport component notes`

### 11.5 Git identity variables
Git itself uses:
- `GIT_AUTHOR_NAME`
- `GIT_AUTHOR_EMAIL`
- `GIT_COMMITTER_NAME`
- `GIT_COMMITTER_EMAIL`
- `GIT_AUTHOR_DATE`
- `GIT_COMMITTER_DATE`

> The user also mentioned `IT_COMMITTER_NAME`. Git does **not** use that variable directly.  
> If any local automation expects it, export it as the same value as `GIT_COMMITTER_NAME`, but Git’s real variable is `GIT_COMMITTER_NAME`.

### Recommended helper function
```bash
set_git_identity () {
  export GIT_AUTHOR_NAME="$1"
  export GIT_AUTHOR_EMAIL="$2"
  export GIT_COMMITTER_NAME="$3"
  export GIT_COMMITTER_EMAIL="$4"
  export IT_COMMITTER_NAME="$3"
  export GIT_AUTHOR_DATE="$5"
  export GIT_COMMITTER_DATE="$6"
}
```

### 11.6 Identity snippets per owner

### Chinthana
```bash
set_git_identity \
  "Chinthana-Weligamage" \
  "chinthanaweligamage1@gmail.com" \
  "Chinthana-Weligamage" \
  "chinthanaweligamage1@gmail.com" \
  "2026-03-23T09:00:00+05:30" \
  "2026-03-23T09:10:00+05:30"
```

### Imesha
```bash
set_git_identity \
  "ImeshaNadeeshani" \
  "imeshanadeeshani761@gmail.com" \
  "ImeshaNadeeshani" \
  "imeshanadeeshani761@gmail.com" \
  "2026-03-24T09:00:00+05:30" \
  "2026-03-24T09:10:00+05:30"
```

### Dilmani
```bash
set_git_identity \
  "DilmaniKiriella" \
  "dilmanikiriella@gmail.com" \
  "DilmaniKiriella" \
  "dilmanikiriella@gmail.com" \
  "2026-03-24T09:20:00+05:30" \
  "2026-03-24T09:30:00+05:30"
```

### Devram
```bash
set_git_identity \
  "Devram-ts" \
  "devramsaparamadu@gmail.com" \
  "Devram-ts" \
  "devramsaparamadu@gmail.com" \
  "2026-03-24T09:40:00+05:30" \
  "2026-03-24T09:50:00+05:30"
```

### 11.7 Branch and merge best practice
For each feature:
```bash
git checkout develop
git pull --rebase origin develop
git checkout -b <feature-branch>

# work...
git add .
git commit -m "feat(...): ..."

git checkout develop
git pull --rebase origin develop
git merge --no-ff <feature-branch> -m "merge(...): integrate <feature-branch>"
git push origin develop
git branch -d <feature-branch>
```

### Conflict rule
If there is a conflict:
- pull latest `develop`
- resolve carefully
- re-run tests
- then merge

Do not force-push over someone else’s work.

---

## 12. Coding standards and implementation rules

### 12.1 General code quality
- use consistent folder structure across all services
- thin controllers
- business logic in service layer
- SQL in repository layer only
- validation in schema/middleware layer
- central error handler
- response shape consistency
- keep functions small and named clearly

### 12.2 Response format
Use a consistent response envelope:
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

On error:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Readable message"
  }
}
```

### 12.3 Validation
- validate all request bodies
- validate path/query params
- never trust client input
- return proper HTTP status codes:
  - `200`
  - `201`
  - `400`
  - `401`
  - `403`
  - `404`
  - `409`
  - `422`
  - `500`

### 12.4 Authentication / authorization
- hash passwords with bcrypt
- sign JWT in User Service
- verify JWT in protected routes
- admin-only routes:
  - create assignment
  - transport announcements
- internal routes require internal token

### 12.5 SQLite rules
In DB init:
- enable foreign keys
- use defensive defaults where supported
- use a busy timeout
- use prepared statements
- use transactions for multi-step updates

### Recommended DB startup concerns
- `PRAGMA foreign_keys = ON`
- `PRAGMA journal_mode = WAL`
- `PRAGMA busy_timeout = 5000`

### 12.6 Logging
- attach a request ID to each request
- log request start + response status
- log internal event sends and receives
- avoid logging passwords or secrets

### 12.7 OpenAPI / Swagger quality
Each service docs must include:
- title
- description
- version
- tags
- auth information
- request schema
- response schema
- example payloads
- both direct and gateway server URLs

### Recommended `servers` entries
Example for User Service:
- `http://localhost:3001`
- `http://localhost:8080/user`

### 12.8 Testing minimum
Each service must have:
- health endpoint test
- one success path test
- one validation failure test
- one auth failure test (where applicable)

Cross-service testing:
- shuttle booking → notification created
- assignment submission → notification created

### 12.9 Documentation discipline
Every feature branch must update:
- its component slide notes
- API catalog if endpoints changed
- team contributions if a major milestone merged

---

## 13. Detailed parallel development timeline (23 March 2026 → 28 March 2026)

> All dates below should be used for `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE`.  
> Use realistic 10–20 minute separation between author and committer timestamps.

| Step | Date/Time (LK) | Owner | Branch | Deliverable | Commit Message | Merge Window |
|---:|---|---|---|---|---|---|
| 1 | 2026-03-23 09:00 | Chinthana | `chinthana/chore/repo-bootstrap` | monorepo init, workspaces, housekeeping files | `chore(repo): initialize monorepo and housekeeping` | 2026-03-23 10:00 |
| 2 | 2026-03-23 11:00 | Chinthana | `chinthana/feat/gateway-bootstrap` | gateway scaffold with Express Gateway | `feat(gateway): scaffold express gateway workspace` | 2026-03-23 12:00 |
| 3 | 2026-03-23 14:00 | Chinthana | `chinthana/chore/shared-foundation` | shared package, scripts skeleton, docs skeleton | `chore(shared): add shared utilities and docs skeleton` | 2026-03-23 15:00 |
| 4 | 2026-03-23 16:30 | Chinthana | `chinthana/chore/tooling-quality` | lint/format/test baseline, root scripts | `chore(tooling): add quality and workflow tooling` | 2026-03-23 17:30 |
| 5 | 2026-03-24 09:00 | Imesha | `imesha/feat/user-service-skeleton` | user service scaffold, DB init, health route, docs skeleton | `feat(user): scaffold service structure and health endpoint` | 2026-03-24 10:30 |
| 6 | 2026-03-24 09:20 | Dilmani | `dilmani/feat/transport-service-skeleton` | transport scaffold, DB init, health route, docs skeleton | `feat(transport): scaffold service structure and health endpoint` | 2026-03-24 10:50 |
| 7 | 2026-03-24 09:40 | Devram | `devram/feat/assignment-service-skeleton` | assignment scaffold, DB init, health route, docs skeleton | `feat(assignment): scaffold service structure and health endpoint` | 2026-03-24 11:10 |
| 8 | 2026-03-24 10:00 | Chinthana | `chinthana/feat/notification-service-skeleton` | notification scaffold, DB init, health route, docs skeleton | `feat(notification): scaffold service structure and health endpoint` | 2026-03-24 11:30 |
| 9 | 2026-03-25 09:00 | Imesha | `imesha/feat/user-auth-profile` | register, login, me, profile update, lookup, swagger, tests | `feat(user): add auth and profile APIs` | 2026-03-25 12:30 |
| 10 | 2026-03-25 09:20 | Dilmani | `dilmani/feat/transport-bookings` | routes, schedules, bookings, cancellations, swagger, tests | `feat(transport): add routes schedules and bookings APIs` | 2026-03-25 12:50 |
| 11 | 2026-03-25 09:40 | Devram | `devram/feat/assignment-core` | modules, assignments, submissions, swagger, tests | `feat(assignment): add assignment and submission APIs` | 2026-03-25 13:10 |
| 12 | 2026-03-25 10:00 | Chinthana | `chinthana/feat/notification-core` | notification CRUD, preferences, docs, tests | `feat(notification): add notification listing and preferences` | 2026-03-25 13:30 |
| 13 | 2026-03-26 09:00 | Chinthana | `chinthana/feat/notification-realtime-sse` | SSE stream, heartbeat, client registry, tests | `feat(notification): add real time sync with sse` | 2026-03-26 11:30 |
| 14 | 2026-03-26 13:00 | Chinthana | `chinthana/feat/gateway-routing` | all gateway service routes, policies, swagger route access | `feat(gateway): add service routing and docs proxying` | 2026-03-26 15:00 |
| 15 | 2026-03-27 09:00 | Imesha | `imesha/feat/user-notification-integration` | emit user events to notification service | `feat(user): integrate notification events` | 2026-03-27 10:30 |
| 16 | 2026-03-27 09:20 | Dilmani | `dilmani/feat/transport-notification-integration` | emit booking and announcement events | `feat(transport): integrate notification events` | 2026-03-27 10:50 |
| 17 | 2026-03-27 09:40 | Devram | `devram/feat/assignment-notification-integration` | emit assignment and submission events | `feat(assignment): integrate notification events` | 2026-03-27 11:10 |
| 18 | 2026-03-27 10:00 | Chinthana | `chinthana/feat/notification-event-ingestion` | internal event endpoint + mapping rules | `feat(notification): add internal event ingestion` | 2026-03-27 11:30 |
| 19 | 2026-03-27 14:00 | Chinthana | `chinthana/chore/integration-smoke` | root smoke tests, end-to-end checks, demo seed alignment | `chore(integration): add smoke tests and cross service checks` | 2026-03-27 16:00 |
| 20 | 2026-03-28 09:00 | Imesha | `imesha/fix/user-hardening` | edge-case fixes, validation, final tests, docs notes | `fix(user): harden validation and auth flows` | 2026-03-28 10:00 |
| 21 | 2026-03-28 09:15 | Dilmani | `dilmani/fix/transport-hardening` | seat integrity fixes, final tests, docs notes | `fix(transport): harden booking integrity and edge cases` | 2026-03-28 10:15 |
| 22 | 2026-03-28 09:30 | Devram | `devram/fix/assignment-hardening` | due-date rules, submission integrity, final tests, docs notes | `fix(assignment): harden submission and due date rules` | 2026-03-28 10:30 |
| 23 | 2026-03-28 10:00 | Chinthana | `chinthana/fix/notification-gateway-hardening` | SSE cleanup, gateway docs verification, final policies | `fix(notification): harden sse and gateway compatibility` | 2026-03-28 11:30 |
| 24 | 2026-03-28 14:00 | Chinthana | `chinthana/docs/demo-prep` | final docs, screenshot checklist, contributions, demo script | `docs(project): finalize documentation and demo preparation` | 2026-03-28 16:00 |
| 25 | 2026-03-28 17:00 | Chinthana | `chinthana/chore/release-candidate` | merge develop to main, tag MVP release candidate | `chore(release): prepare mvp release candidate` | 2026-03-28 18:00 |

---

## 14. Step-by-step execution plan for the coding agent

> This section is the direct implementation script/guide.  
> Follow it in order.  
> **Commit after every numbered step.**  
> Use the owner identity and dates from the timeline above.

# Step 1 — Bootstrap the monorepo (Chinthana)
### Branch
`chinthana/chore/repo-bootstrap`

### Tasks
- initialize git repository
- create `main` and `develop`
- create root `package.json`
- configure workspaces
- add `.gitignore`, `.editorconfig`, `.nvmrc`, `README.md`
- create base directories

### Validation
- `git status` clean after commit
- root workspace exists
- branch structure exists

### Commit
`chore(repo): initialize monorepo and housekeeping`

---

# Step 2 — Scaffold the API gateway (Chinthana)
### Branch
`chinthana/feat/gateway-bootstrap`

### Tasks
- install Express Gateway CLI
- scaffold gateway inside `/gateway`
- set gateway port to `8080`
- remove unneeded default sample config
- keep gateway bootable

### Validation
- `cd gateway && npm install`
- `npm start` runs gateway successfully
- basic gateway config file committed

### Commit
`feat(gateway): scaffold express gateway workspace`

---

# Step 3 — Add shared utilities and docs skeleton (Chinthana)
### Branch
`chinthana/chore/shared-foundation`

### Tasks
- create `packages/shared/`
- add common response helper
- add env helper
- add request ID helper
- add internal HTTP helper
- add docs skeleton files in `docs/`
- add `docs/slides/` placeholders

### Validation
- shared package imports successfully
- docs tree exists

### Commit
`chore(shared): add shared utilities and docs skeleton`

---

# Step 4 — Add root tooling and scripts (Chinthana)
### Branch
`chinthana/chore/tooling-quality`

### Tasks
- add lint config
- add prettier config
- add root scripts placeholders
- add smoke script placeholders
- document workflow in `README.md`

### Validation
- `npm run lint` placeholder or real command works
- no broken package.json scripts

### Commit
`chore(tooling): add quality and workflow tooling`

---

# Step 5 — Scaffold User Service (Imesha)
### Branch
`imesha/feat/user-service-skeleton`

### Tasks
- initialize workspace package
- install service dependencies
- create folder structure
- create `src/app.js`, `src/server.js`
- create DB connection and migration skeleton
- add `/health`
- add `/docs` and `/openapi.json` skeleton
- add slide notes stub for user service

### Validation
- service starts on `3001`
- `GET /health` works
- Swagger page loads

### Commit
`feat(user): scaffold service structure and health endpoint`

---

# Step 6 — Scaffold Transport Service (Dilmani)
### Branch
`dilmani/feat/transport-service-skeleton`

### Tasks
- same scaffold pattern as User Service
- create transport DB migration skeleton
- add `/health`
- add docs skeleton
- add transport slide notes stub

### Validation
- service starts on `3002`
- `GET /health` works
- Swagger page loads

### Commit
`feat(transport): scaffold service structure and health endpoint`

---

# Step 7 — Scaffold Assignment Service (Devram)
### Branch
`devram/feat/assignment-service-skeleton`

### Tasks
- same scaffold pattern
- DB migration skeleton for modules/assignments/submissions
- add `/health`
- add docs skeleton
- add assignment slide notes stub

### Validation
- service starts on `3003`
- `GET /health` works
- Swagger page loads

### Commit
`feat(assignment): scaffold service structure and health endpoint`

---

# Step 8 — Scaffold Notification Service (Chinthana)
### Branch
`chinthana/feat/notification-service-skeleton`

### Tasks
- same scaffold pattern
- DB migration skeleton for notifications/preferences
- add `/health`
- add docs skeleton
- add notification slide notes stub

### Validation
- service starts on `3004`
- `GET /health` works
- Swagger page loads

### Commit
`feat(notification): scaffold service structure and health endpoint`

---

# Step 9 — Implement User Service core APIs (Imesha)
### Branch
`imesha/feat/user-auth-profile`

### Tasks
- create `users` table migration
- implement registration
- implement login
- implement JWT signing
- implement auth middleware
- implement `GET /me`
- implement `PATCH /me`
- implement `GET /students/:studentId`
- add Swagger schemas/examples
- add tests
- update `docs/API_CATALOG.md`
- update `docs/slides/02-user-service.md`

### Validation
- register works
- login returns token
- `/me` rejects missing token
- `/me` works with token
- Swagger shows all endpoints

### Commit
`feat(user): add auth and profile APIs`

---

# Step 10 — Implement Transport Service core APIs (Dilmani)
### Branch
`dilmani/feat/transport-bookings`

### Tasks
- create `routes`, `schedules`, `bookings`, `announcements`
- add seed data for realistic Malabe routes
- implement `GET /routes`
- implement `GET /routes/:routeId/schedules`
- implement `POST /bookings`
- implement `GET /users/:userId/bookings`
- implement `PATCH /bookings/:bookingId/cancel`
- implement `POST /announcements`
- transaction-protect seat booking/cancellation
- add Swagger docs and tests
- update API catalog + slide notes

### Validation
- routes list works
- booking decrements seat count
- cancel restores seat count
- admin-only announcement route enforced

### Commit
`feat(transport): add routes schedules and bookings APIs`

---

# Step 11 — Implement Assignment Service core APIs (Devram)
### Branch
`devram/feat/assignment-core`

### Tasks
- create `modules`, `assignments`, `submissions`
- seed realistic modules
- implement `GET /modules/:moduleCode/assignments`
- implement `GET /assignments/:assignmentId`
- implement `POST /assignments`
- implement `POST /assignments/:assignmentId/submissions`
- implement `GET /students/:userId/submissions`
- validate due dates and auth roles
- add Swagger docs and tests
- update API catalog + slide notes

### Validation
- module assignment listing works
- admin assignment creation works
- student submission works
- invalid module/due date errors are handled

### Commit
`feat(assignment): add assignment and submission APIs`

---

# Step 12 — Implement Notification Service core CRUD and preferences (Chinthana)
### Branch
`chinthana/feat/notification-core`

### Tasks
- create `notifications`, `preferences`, optional `delivery_logs`
- implement `GET /users/:userId/notifications`
- implement `PATCH /notifications/:notificationId/read`
- implement `PATCH /users/:userId/notifications/read-all`
- implement `PUT /users/:userId/preferences`
- add docs and tests
- update API catalog + slide notes

### Validation
- notifications list works
- read/unread updates work
- preferences persist correctly

### Commit
`feat(notification): add notification listing and preferences`

---

# Step 13 — Add real-time SSE to Notification Service (Chinthana)
### Branch
`chinthana/feat/notification-realtime-sse`

### Tasks
- implement `GET /stream`
- maintain in-memory user stream registry
- add heartbeat logic
- add disconnect cleanup
- on new notification insert, push SSE event
- document reconnection strategy
- test with curl / browser / script
- update `docs/slides/05-notification-service.md`

### Validation
- authenticated user connects to SSE
- creating a notification pushes a live event
- disconnect cleanup works
- no memory leak obvious in local testing

### Commit
`feat(notification): add real time sync with sse`

---

# Step 14 — Add gateway routing and policy configuration (Chinthana)
### Branch
`chinthana/feat/gateway-routing`

### Tasks
- define service endpoints for all 4 services
- define API endpoints:
  - `/user*`
  - `/transport*`
  - `/assignment*`
  - `/notification*`
- configure pipelines
- enable `cors`, `log`, `proxy`
- use `stripPath: true`
- verify `/docs` and `/openapi.json` work through gateway
- update `docs/slides/06-api-gateway.md`

### Validation
- each service health endpoint reachable via gateway
- each Swagger page reachable via gateway
- direct and gateway endpoint parity verified

### Commit
`feat(gateway): add service routing and docs proxying`

---

# Step 15 — Integrate User Service with Notification Service (Imesha)
### Branch
`imesha/feat/user-notification-integration`

### Tasks
- after successful register, emit `user.registered`
- after profile update, emit `user.profile.updated`
- add robust internal HTTP error handling
- do not let notification failure break core user flow; log it clearly
- update docs

### Validation
- registration triggers notification record
- registration still succeeds even if notification service unavailable (graceful degradation)
- event payload matches contract

### Commit
`feat(user): integrate notification events`

---

# Step 16 — Integrate Transport Service with Notification Service (Dilmani)
### Branch
`dilmani/feat/transport-notification-integration`

### Tasks
- emit `transport.booking.created`
- emit `transport.booking.cancelled`
- emit `transport.announcement.created`
- ensure payload contains booking/schedule/route details useful for notifications
- update docs

### Validation
- booking creates notification
- cancellation creates notification
- announcement creates notification
- transport flow still succeeds if notification service is temporarily down

### Commit
`feat(transport): integrate notification events`

---

# Step 17 — Integrate Assignment Service with Notification Service (Devram)
### Branch
`devram/feat/assignment-notification-integration`

### Tasks
- emit `assignment.created`
- emit `assignment.submission.recorded`
- optional `assignment.deadline.reminder` only if time remains
- ensure student receives confirmation notification after submission
- update docs

### Validation
- assignment creation triggers event
- submission triggers event
- payload includes assignment title/module code for readable notifications

### Commit
`feat(assignment): integrate notification events`

---

# Step 18 — Implement internal event ingestion in Notification Service (Chinthana)
### Branch
`chinthana/feat/notification-event-ingestion`

### Tasks
- implement `POST /internal/events`
- validate internal token
- validate payload schema
- map incoming event types to stored notification records
- apply preference filtering
- push live SSE if user connected
- add tests for accepted/rejected events

### Validation
- unauthorized internal call rejected
- valid event stored
- valid event pushes live to SSE connection
- disabled preference suppresses unwanted categories

### Commit
`feat(notification): add internal event ingestion`

---

# Step 19 — Add integration smoke testing (Chinthana)
### Branch
`chinthana/chore/integration-smoke`

### Tasks
- create root smoke-test script
- verify direct URLs
- verify gateway URLs
- verify register → notification
- verify booking → notification
- verify submission → notification
- add `docs/SCREENSHOT_CHECKLIST.md`
- add `docs/DEMO_SCRIPT.md`

### Validation
- smoke test runs end-to-end without manual edits
- output clearly shows pass/fail

### Commit
`chore(integration): add smoke tests and cross service checks`

---

# Step 20 — Final hardening: User Service (Imesha)
### Branch
`imesha/fix/user-hardening`

### Tasks
- tighten validation
- enforce email uniqueness
- improve auth error messages
- confirm direct and gateway Swagger URLs
- ensure slide notes are current

### Validation
- tests green
- no duplicate registration bug
- docs accurate

### Commit
`fix(user): harden validation and auth flows`

---

# Step 21 — Final hardening: Transport Service (Dilmani)
### Branch
`dilmani/fix/transport-hardening`

### Tasks
- prevent negative seat counts
- improve cancellation idempotency
- harden announcement validation
- verify gateway docs and routes
- ensure slide notes are current

### Validation
- no overbooking
- cancel twice handled safely
- tests green

### Commit
`fix(transport): harden booking integrity and edge cases`

---

# Step 22 — Final hardening: Assignment Service (Devram)
### Branch
`devram/fix/assignment-hardening`

### Tasks
- tighten due-date rules
- prevent malformed submission URLs
- define policy for repeat submissions and implement it cleanly
- verify gateway docs and routes
- ensure slide notes are current

### Validation
- tests green
- invalid submissions rejected cleanly
- no hidden runtime errors

### Commit
`fix(assignment): harden submission and due date rules`

---

# Step 23 — Final hardening: Notification + Gateway (Chinthana)
### Branch
`chinthana/fix/notification-gateway-hardening`

### Tasks
- SSE stability cleanup
- verify gateway proxy works for docs assets
- confirm rate-limit/log policy behavior
- ensure preferences and live push both work
- ensure slide notes are current

### Validation
- SSE remains stable during manual test
- all gateway docs URLs load correctly
- smoke tests pass again

### Commit
`fix(notification): harden sse and gateway compatibility`

---

# Step 24 — Finalize docs for later slide deck creation (Chinthana)
### Branch
`chinthana/docs/demo-prep`

### Tasks
- finalize `docs/ARCHITECTURE.md`
- finalize `docs/API_CATALOG.md`
- finalize `docs/TEAM_CONTRIBUTIONS.md`
- finalize `docs/SCREENSHOT_CHECKLIST.md`
- finalize `docs/DEMO_SCRIPT.md`
- review all `docs/slides/*.md`
- ensure names, emails, and component ownership are recorded clearly

### Validation
- docs folder is presentation-ready
- every service has slide notes
- contribution ownership is explicit

### Commit
`docs(project): finalize documentation and demo preparation`

---

# Step 25 — Release candidate merge (Chinthana)
### Branch
`chinthana/chore/release-candidate`

### Tasks
- pull latest `develop`
- run full smoke tests
- merge `develop` into `main`
- create MVP release candidate tag if desired
- do not add new features after this point

### Validation
- `main` is demo-ready
- system boots with no build/runtime breaks
- direct and gateway endpoints verified

### Commit
`chore(release): prepare mvp release candidate`

---

## 15. Service-level acceptance criteria

### 15.1 User Service acceptance
- register works
- login works
- JWT auth works
- profile view/update works
- internal lookup works
- Swagger direct and gateway access both work

### 15.2 Transport Service acceptance
- list routes and schedules works
- booking works without overbooking
- cancellation restores availability
- announcement route works for admin
- notification integration works
- Swagger direct and gateway access both work

### 15.3 Assignment Service acceptance
- list assignments works
- create assignment works for admin
- submission flow works
- submission history works
- notification integration works
- Swagger direct and gateway access both work

### 15.4 Notification Service acceptance
- internal events accepted only with internal token
- notifications list works
- read/unread works
- preferences work
- SSE pushes live notifications
- Swagger direct and gateway access both work

### 15.5 Gateway acceptance
- all services reachable through single port `8080`
- health endpoints reachable through gateway
- Swagger docs reachable through gateway
- proxy path rewriting works correctly
- no service port needs to be exposed to end users in the demo

---

## 16. Docs that must be maintained during development for the future slide deck

### 16.1 Mandatory docs
Create and keep updated:

### `docs/ARCHITECTURE.md`
Include:
- system overview
- architecture diagram
- routing model
- service boundaries
- inter-service communication model

### `docs/API_CATALOG.md`
Include:
- every endpoint
- method
- auth requirement
- sample request
- sample response
- direct URL
- gateway URL

### `docs/TEAM_CONTRIBUTIONS.md`
Include:
- member name
- email
- component
- branch names used
- commit summary
- major deliverables

### `docs/SCREENSHOT_CHECKLIST.md`
Include placeholders for:
- folder structure
- native Swagger pages
- gateway Swagger pages
- direct endpoint samples
- gateway endpoint samples
- SSE / notification evidence

### `docs/DEMO_SCRIPT.md`
Include:
- startup order
- seed/reset steps
- exact demo walkthrough
- fallback plan if one service fails

### `docs/slides/*.md`
Each file should contain slide-ready notes, not raw code dumps.

### 16.2 Slide notes structure per component
Each `docs/slides/0x-*.md` should contain:
1. component name
2. owner
3. service responsibility
4. why it is separate in the architecture
5. DB tables
6. APIs
7. integration with other services
8. validations/security
9. screenshots to capture later
10. contribution summary

---

## 17. Testing and smoke-check matrix

| Check | Direct Service | Via Gateway | Required |
|---|---|---|---|
| Health endpoint | Yes | Yes | Yes |
| Swagger UI | Yes | Yes | Yes |
| OpenAPI JSON | Yes | Yes | Yes |
| User register/login | Yes | Yes | Yes |
| Transport booking | Yes | Yes | Yes |
| Assignment submission | Yes | Yes | Yes |
| Notification list | Yes | Yes | Yes |
| Notification SSE | Yes | Prefer yes | Yes for service, stretch via gateway |

### Recommended smoke flow order
1. Start all services
2. Start gateway
3. Check all direct `/health`
4. Check all gateway `/.../health`
5. Check all direct `/docs`
6. Check all gateway `/.../docs`
7. Register/login user
8. Book shuttle
9. Confirm notification stored and streamed
10. Submit assignment
11. Confirm notification stored and streamed

---

## 18. Practical implementation tips

### 18.1 Use realistic data, not lorem ipsum
Use SLIIT-style data:
- module codes
- shuttle routes to Malabe
- student numbers/emails
- proper service names in Swagger titles

### 18.2 Keep SQL simple and explicit
Avoid ORM complexity for this MVP.  
SQLite + prepared statements + repository layer is enough.

### 18.3 Keep real-time only in Notification Service
Do not add WebSocket/SSE elsewhere.

### 18.4 Graceful degradation rule
If Notification Service is temporarily unavailable:
- User/Transport/Assignment flows should still succeed
- log the failure
- do not crash the producer service

### 18.5 Avoid hidden coupling
- do not import one service’s repository into another service
- communicate only over HTTP/internal contracts

### 18.6 Preserve author history
Never make a large “cleanup” commit under the wrong person’s identity that hides the original component ownership.

---

## 19. Final code-freeze checklist for 28 March 2026 evening

Before declaring MVP complete, confirm all of the following:

- [ ] `main` is up to date from `develop`
- [ ] no unresolved merge conflicts
- [ ] all services start successfully
- [ ] gateway starts successfully
- [ ] all direct health routes pass
- [ ] all gateway health routes pass
- [ ] all native Swagger URLs load
- [ ] all gateway Swagger URLs load
- [ ] register/login flow works
- [ ] booking flow works
- [ ] assignment submission flow works
- [ ] notification storage works
- [ ] real-time notification stream works
- [ ] root smoke test passes
- [ ] docs folder is updated
- [ ] team contributions are recorded
- [ ] no `.env` or `.sqlite` files are committed

---

## 20. Short conclusion for the coding agent

Build **SLIIT CampusLink (Malabe)** as a clean monorepo with:
- **4 clearly separated Express microservices**
- **1 Express Gateway**
- **SQLite per service**
- **Swagger per service**
- **real-time SSE only in Notification Service**
- **strong Git history with correct ownership, dates, branches, and merges**

Do not chase extra features until:
1. all 4 services are stable,
2. gateway routing is correct,
3. direct + gateway Swagger URLs work,
4. notification integrations work,
5. tests and smoke checks pass.

Once the system is stable, the slide deck becomes much easier because the docs structure in this plan already prepares the content needed for final presentation.
