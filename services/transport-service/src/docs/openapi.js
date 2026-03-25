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
          responses: { 201: { description: 'Booking created' } }
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
          responses: { 201: { description: 'Announcement created' } }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
