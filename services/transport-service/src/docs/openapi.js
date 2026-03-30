function createOpenApi() {
  return {
    openapi: '3.0.4',
    info: {
      title: 'CampusLink Transport Service API',
      version: '1.0.0',
      description: 'Shuttle routes, schedules, bookings, and transport announcements.'
    },
    servers: [
      { url: 'http://localhost:3002', description: 'Direct service access' },
      { url: 'http://localhost:8080/transport', description: 'Gateway access' }
    ],
    tags: [
      { name: 'Health' },
      { name: 'Routes' },
      { name: 'Bookings' },
      { name: 'Announcements' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        BookingRequest: {
          type: 'object',
          required: ['scheduleId'],
          properties: {
            scheduleId: {
              type: 'string',
              description: 'Use a real schedule ID from GET /routes/{routeId}/schedules. The seeded demo DB includes SCH-001 to SCH-008 after a reset.',
              example: 'SCH-003'
            }
          }
        },
        AnnouncementRequest: {
          type: 'object',
          required: ['title', 'message', 'type'],
          properties: {
            routeId: {
              type: 'string',
              description: 'Optional route scope. Use a real route ID from GET /routes. The seeded demo DB includes RTE-001 to RTE-004 after a reset.',
              example: 'RTE-002'
            },
            targetUserId: { type: 'string', example: 'USR-a1b2c3d4' },
            title: { type: 'string', example: 'Makumbura shuttle delayed' },
            message: { type: 'string', example: 'The 7:30 AM shuttle will depart 15 minutes late.' },
            type: { type: 'string', enum: ['delay', 'cancellation', 'general'], example: 'delay' }
          }
        },
        BookingResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'BKG-001' },
                scheduleId: { type: 'string', example: 'SCH-003' },
                userId: { type: 'string', example: 'USR-a1b2c3d4' },
                routeName: { type: 'string', example: 'Makumbura Shuttle' },
                departureTime: { type: 'string', example: '07:30' },
                travelDate: { type: 'string', example: '2026-03-30' },
                status: { type: 'string', example: 'confirmed' }
              }
            }
          }
        }
      }
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Service health check',
          responses: { 200: { description: 'Healthy' } }
        }
      },
      '/routes': {
        get: {
          tags: ['Routes'],
          summary: 'List shuttle routes',
          responses: { 200: { description: 'Routes returned' } }
        }
      },
      '/routes/{routeId}/schedules': {
        get: {
          tags: ['Routes'],
          summary: 'List schedules for a route',
          parameters: [
            {
              name: 'routeId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: { 200: { description: 'Schedules returned' } }
        }
      },
      '/bookings': {
        post: {
          tags: ['Bookings'],
          summary: 'Book a shuttle seat',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BookingRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'Booking created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BookingResponse' }
                }
              }
            }
          }
        }
      },
      '/users/{userId}/bookings': {
        get: {
          tags: ['Bookings'],
          summary: 'List bookings for a user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Bookings returned' } }
        }
      },
      '/bookings/{bookingId}/cancel': {
        patch: {
          tags: ['Bookings'],
          summary: 'Cancel a booking',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Booking cancelled' } }
        }
      },
      '/announcements': {
        post: {
          tags: ['Announcements'],
          summary: 'Create a transport announcement',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AnnouncementRequest' }
              }
            }
          },
          responses: { 201: { description: 'Announcement created' } }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
