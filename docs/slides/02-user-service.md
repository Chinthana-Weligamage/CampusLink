# User Service

- Purpose: identity, registration, login, and student profile management
- Why separate: authentication and student records are foundational cross-cutting concerns
- Tables: `users`, `auth_audit_logs`
- Auth strategy: bcrypt for passwords, JWT for service-level auth
- Capture later: register, login, profile, and Swagger screenshots
