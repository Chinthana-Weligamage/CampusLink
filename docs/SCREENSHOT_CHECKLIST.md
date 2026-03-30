# Screenshot Checklist

Use gateway URLs where possible so the screenshots show the integrated system. Keep one student JWT and one admin JWT ready in Swagger Authorize dialogs or Postman environment variables.

Use these screenshot IDs in filenames, slide references, and the final report so each capture is easy to trace.

## 1. Gateway Home And Route Map

- Screenshot ID: `SS-01`
- URL: `http://localhost:8080/`
- Steps:
  1. Start gateway and all four services.
  2. Open the gateway root URL in the browser.
  3. Capture the JSON response showing `routes` and `docs`.
- Sample request object: none required for this screenshot.

## 2. User Service Swagger UI

- Screenshot ID: `SS-02`
- URL: `http://localhost:3001/docs`
- Steps:
  1. Open the direct User Service Swagger page.
  2. Expand `POST /register` and `POST /login`.
  3. Keep the sample request body visible in the screenshot.
- Sample request object for `POST /register`:

```json
{
  "studentNo": "IT2026100",
  "fullName": "Nethmi Silva",
  "email": "nethmi@my.sliit.lk",
  "password": "Student@123",
  "faculty": "Computing",
  "specialization": "Information Technology",
  "intakeYear": 2026,
  "contactNo": "0771234567",
  "defaultPickupStop": "Makumbura"
}
```

- Sample request object for `POST /login`:

```json
{
  "email": "nethmi@my.sliit.lk",
  "password": "Student@123"
}
```

## 3. Transport Service Swagger UI

- Screenshot ID: `SS-03`
- URL: `http://localhost:3002/docs`
- Steps:
  1. Open the direct Transport Service Swagger page.
  2. Expand `POST /bookings` and `POST /announcements`.
  3. Capture the page with one request example visible.
- Sample request object for `POST /bookings`:

```json
{
  "scheduleId": "SCH-003"
}
```

- Sample request object for `POST /announcements`:

```json
{
  "routeId": "RTE-002",
  "title": "Morning shuttle delayed",
  "message": "The Malabe to Metro Campus shuttle will leave 15 minutes later than usual.",
  "type": "delay"
}
```

- Demo note: after `npm run db:reset:transport`, the seeded transport IDs are stable as `RTE-001` to `RTE-004` and `SCH-001` to `SCH-008`.

## 4. Assignment Service Swagger UI

- Screenshot ID: `SS-04`
- URL: `http://localhost:3003/docs`
- Steps:
  1. Open the direct Assignment Service Swagger page.
  2. Expand `POST /assignments` and `POST /assignments/{assignmentId}/submissions`.
  3. Capture the request sample and the endpoint list.
- Sample request object for `POST /assignments`:

```json
{
  "moduleCode": "IT3040",
  "title": "Microservices Coursework Demo",
  "description": "Prepare the API demo, screenshots, and explanation for the CampusLink microservices coursework.",
  "dueAt": "2026-04-15T23:59:00+05:30"
}
```

- Sample request object for `POST /assignments/{assignmentId}/submissions`:

```json
{
  "submissionUrl": "https://github.com/team-campuslink/demo-submission",
  "notes": "Includes project source, screenshot evidence, and demo notes."
}
```

## 5. Notification Service Swagger UI

- Screenshot ID: `SS-05`
- URL: `http://localhost:3004/docs`
- Steps:
  1. Open the direct Notification Service Swagger page.
  2. Expand `POST /internal/events` and `PUT /users/{userId}/preferences`.
  3. Capture the visible request payload example.
- Sample request object for `POST /internal/events`:

```json
{
  "eventType": "transport.booking.created",
  "sourceService": "transport-service",
  "userId": "usr_student_001",
  "title": "Shuttle booking confirmed",
  "message": "Your seat has been booked for the morning shuttle.",
  "payload": {
    "bookingId": "bk_1001",
    "scheduleId": "SCH-003"
  },
  "occurredAt": "2026-03-30T09:00:00+05:30"
}
```

- Sample request object for `PUT /users/{userId}/preferences`:

```json
{
  "transportEnabled": true,
  "assignmentEnabled": true,
  "systemEnabled": true
}
```

## 6. Gateway-Proxied Swagger UI For Each Service

- Screenshot IDs:
  - `SS-06A` for User Service via gateway
  - `SS-06B` for Transport Service via gateway
  - `SS-06C` for Assignment Service via gateway
  - `SS-06D` for Notification Service via gateway
- URLs:
  - `http://localhost:8080/user/docs`
  - `http://localhost:8080/transport/docs`
  - `http://localhost:8080/assignment/docs`
  - `http://localhost:8080/notification/docs`
- Steps:
  1. Open each gateway-proxied Swagger page.
  2. Confirm the pages load through the gateway, not the direct ports.
  3. Capture either one collage or four separate screenshots.
- Sample request objects: reuse the direct-service samples above.

## 7. User Registration And Login Success

- Screenshot IDs:
  - `SS-07A` for registration success
  - `SS-07B` for login success
  - `SS-07C` for optional `GET /me`
- Recommended URL: `http://localhost:8080/user/docs`
- Steps:
  1. Run `POST /register` with the student payload below and capture the `201` response.
  2. Run `POST /login` with the same credentials and capture the `200` response with the JWT.
  3. Optional: use `GET /me` with the returned bearer token for an additional authenticated screenshot.
- Sample request object for registration:

```json
{
  "studentNo": "IT2026100",
  "fullName": "Nethmi Silva",
  "email": "nethmi@my.sliit.lk",
  "password": "Student@123",
  "faculty": "Computing",
  "specialization": "Information Technology",
  "intakeYear": 2026,
  "contactNo": "0771234567",
  "defaultPickupStop": "Makumbura"
}
```

- Sample request object for login:

```json
{
  "email": "nethmi@my.sliit.lk",
  "password": "Student@123"
}
```

## 8. Shuttle Booking Success

- Screenshot ID: `SS-08`
- Recommended URL: `http://localhost:8080/transport/docs`
- Steps:
  1. Log in as the student and copy the JWT.
  2. Run `GET /routes` and `GET /routes/{routeId}/schedules` to find a valid schedule ID.
  3. Authorize Swagger with the student token.
  4. Run `POST /bookings` and capture the `201` response.
- Sample request object:

```json
{
  "scheduleId": "SCH-003"
}
```

## 9. Notification List After Booking

- Screenshot ID: `SS-09`
- Recommended URL: `http://localhost:8080/notification/docs`
- Steps:
  1. Complete the shuttle booking screenshot first.
  2. Authorize Swagger with the same student token.
  3. Run `GET /users/{userId}/notifications` with the logged-in user ID.
  4. Capture the response showing the booking notification.
- Sample request object: none required for this `GET` request.
- Sample path parameter values:

```json
{
  "userId": "usr_student_001"
}
```

## 10. SSE Stream Receiving A Live Event

- Screenshot ID: `SS-10`
- Recommended URL: `http://localhost:8080/notification/stream`
- Steps:
  1. Open an SSE client, browser tab, or Postman request for `GET /stream` with the student bearer token.
  2. Keep the stream open.
  3. In another tab, trigger a booking or send an internal event.
  4. Capture the SSE output after a new event arrives.
- Sample request object for the event trigger:

```json
{
  "eventType": "assignment.submission.recorded",
  "sourceService": "assignment-service",
  "userId": "usr_student_001",
  "title": "Assignment submission recorded",
  "message": "Your submission for Microservices Coursework Demo has been recorded.",
  "payload": {
    "assignmentId": "asg_1001",
    "submissionId": "sub_1001"
  },
  "occurredAt": "2026-03-30T09:10:00+05:30"
}
```

## 11. Assignment Creation And Submission Success

- Screenshot IDs:
  - `SS-11A` for assignment creation
  - `SS-11B` for assignment submission
- Recommended URL: `http://localhost:8080/assignment/docs`
- Steps:
  1. Log in as an admin user and authorize Swagger.
  2. Run `POST /assignments` with the admin token and capture the `201` response.
  3. Copy the returned assignment ID.
  4. Switch authorization to the student token.
  5. Run `POST /assignments/{assignmentId}/submissions` and capture the `201` response.
- Sample request object for assignment creation:

```json
{
  "moduleCode": "IT3040",
  "title": "Microservices Coursework Demo",
  "description": "Prepare the API demo, screenshots, and explanation for the CampusLink microservices coursework.",
  "dueAt": "2026-04-15T23:59:00+05:30"
}
```

- Sample request object for submission:

```json
{
  "submissionUrl": "https://github.com/team-campuslink/demo-submission",
  "notes": "Final submission with source code, test evidence, and screenshots."
}
```
