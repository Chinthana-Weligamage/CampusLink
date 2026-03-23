# Transport Service

- Purpose: routes, schedules, bookings, cancellations, and announcements
- Why separate: transport booking has its own transaction and seat-capacity rules
- Tables: `routes`, `schedules`, `bookings`, `announcements`
- Booking logic: create booking and decrement seats inside one transaction
- Capture later: routes, booking, cancellation, and Swagger screenshots
