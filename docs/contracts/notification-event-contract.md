# Notification Event Contract

## Endpoint

`POST /internal/events`

## Authentication

Internal producers must send:

```http
Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
```

## Required Payload

```json
{
  "eventType": "transport.booking.created",
  "sourceService": "transport-service",
  "userId": "USR-123",
  "title": "Shuttle booking confirmed",
  "message": "Your shuttle booking is confirmed.",
  "payload": {},
  "occurredAt": "2026-03-26T11:30:00+05:30"
}
```

## Producers

- User Service
- Transport Service
- Assignment Service

## Consumer

- Notification Service
