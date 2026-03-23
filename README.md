# SLIIT CampusLink (Malabe)

Microservices MVP backend for SLIIT Malabe campus operations. The system is organized as a Node.js npm workspace with four business services and one API gateway.

## Services

- `gateway` on `:8080`
- `user-service` on `:3001`
- `transport-service` on `:3002`
- `assignment-service` on `:3003`
- `notification-service` on `:3004`

## Stack

- Node.js 24.x
- Express
- SQLite via `node:sqlite`
- Swagger UI / OpenAPI 3.0.4
- Server-Sent Events for notification sync

## Workspace Commands

- `npm run dev:user`
- `npm run dev:transport`
- `npm run dev:assignment`
- `npm run dev:notification`
- `npm run dev:gateway`
- `npm run dev:all`
- `npm run test:all`
- `npm run smoke`
- `npm run lint`
- `npm run verify:docs`

## Install

```bash
npm install
```

## Demo Flow

1. Register and log in through the User Service.
2. Book a shuttle seat through the Transport Service.
3. Receive a live notification from the Notification Service.
4. View assignments and submit work through the Assignment Service.
5. Access all service docs directly and through the gateway.

## Documentation

- Main implementation plan: `documentation/PLAN.md`
- Assignment docs set: `docs/`
