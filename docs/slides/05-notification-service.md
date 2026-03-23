# Notification Service

- Purpose: notification storage, preferences, read-state management, and real-time sync
- Why separate: live delivery belongs in one service with a stable event ingestion contract
- Tables: `notifications`, `preferences`, `delivery_logs`
- SSE flow: authenticate, keep connection map, push after persistence, remove on disconnect
- Capture later: internal event flow, stream test, notification list, and Swagger screenshots
