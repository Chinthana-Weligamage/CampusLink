# API Catalog

## User Service

- `POST /register`
- `POST /login`
- `GET /me`
- `PATCH /me`
- `GET /students/:studentId`
- `GET /health`

## Transport Service

- `GET /routes`
- `GET /routes/:routeId/schedules`
- `POST /bookings`
- `GET /users/:userId/bookings`
- `PATCH /bookings/:bookingId/cancel`
- `POST /announcements`
- `GET /health`

## Assignment Service

- `GET /modules/:moduleCode/assignments`
- `GET /assignments/:assignmentId`
- `POST /assignments`
- `POST /assignments/:assignmentId/submissions`
- `GET /students/:userId/submissions`
- `GET /health`

## Notification Service

- `POST /internal/events`
- `GET /users/:userId/notifications`
- `PATCH /notifications/:notificationId/read`
- `PATCH /users/:userId/notifications/read-all`
- `PUT /users/:userId/preferences`
- `GET /stream`
- `GET /health`
