# Architecture

## Overview

SLIIT CampusLink uses an API gateway in front of four microservices:

- User Service
- Transport Service
- Assignment Service
- Notification Service

Each service owns its own SQLite database and OpenAPI document. Cross-service notifications are delivered through a simple internal HTTP event contract.

## Runtime Topology

- Gateway: `http://localhost:8080`
- User Service: `http://localhost:3001`
- Transport Service: `http://localhost:3002`
- Assignment Service: `http://localhost:3003`
- Notification Service: `http://localhost:3004`

## Integration Model

- Client traffic enters through the gateway.
- Services validate JWT locally.
- User, Transport, and Assignment services emit internal notification events.
- Notification Service persists notifications and pushes live SSE updates to connected clients.
