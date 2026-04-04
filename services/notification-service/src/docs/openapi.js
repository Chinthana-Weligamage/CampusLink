function createOpenApi() {
  return {
    openapi: '3.0.4',
    info: {
      title: 'CampusLink Notification Service API',
      version: '1.0.0',
      description: 'Notification storage, preferences, internal event ingestion, and SSE sync.'
    },
    servers: [
      { url: './', description: 'Current access path (direct or gateway)' },
      { url: 'http://localhost:3004', description: 'Direct service access' },
      { url: 'http://localhost:8080/notification', description: 'Gateway access' }
    ],
    tags: [
      { name: 'Health' },
      { name: 'Internal Events' },
      { name: 'Notifications' },
      { name: 'Preferences' },
      { name: 'Realtime' }
    ],
    components: {
      parameters: {
        userId: {
          name: 'userId',
          in: 'path',
          required: true,
          description: 'User identifier whose notification data is being accessed.',
          schema: {
            type: 'string',
            example: 'USR-001'
          }
        },
        notificationId: {
          name: 'notificationId',
          in: 'path',
          required: true,
          description: 'Notification identifier.',
          schema: {
            type: 'string',
            example: 'NTF-001'
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        InternalEventRequest: {
          type: 'object',
          required: ['eventType', 'sourceService', 'userId', 'title', 'message', 'occurredAt'],
          properties: {
            eventType: { type: 'string', example: 'transport.booking.created' },
            sourceService: { type: 'string', example: 'transport-service' },
            userId: { type: 'string', example: 'USR-a1b2c3d4' },
            title: { type: 'string', example: 'Shuttle booking confirmed' },
            message: { type: 'string', example: 'Your 7:30 AM shuttle booking is confirmed.' },
            payload: {
              type: 'object',
              additionalProperties: true,
              example: {
                bookingId: 'BKG-001',
                scheduleId: 'SCH-001'
              }
            },
            occurredAt: { type: 'string', format: 'date-time', example: '2026-03-30T07:35:00+05:30' }
          }
        },
        PreferenceUpdateRequest: {
          type: 'object',
          properties: {
            transportEnabled: { type: 'boolean', example: true },
            assignmentEnabled: { type: 'boolean', example: true },
            systemEnabled: { type: 'boolean', example: false }
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
      '/internal/events': {
        post: {
          tags: ['Internal Events'],
          summary: 'Ingest an internal notification event',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/InternalEventRequest' }
              }
            }
          },
          responses: { 201: { description: 'Event processed' } }
        }
      },
      '/users/{userId}/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'List notifications for a user',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/userId' }
          ],
          responses: { 200: { description: 'Notifications returned' } }
        }
      },
      '/notifications/{notificationId}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark a notification as read',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/notificationId' }
          ],
          responses: { 200: { description: 'Notification updated' } }
        }
      },
      '/users/{userId}/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/userId' }
          ],
          responses: { 200: { description: 'Notifications updated' } }
        }
      },
      '/users/{userId}/preferences': {
        put: {
          tags: ['Preferences'],
          summary: 'Update notification preferences',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/userId' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PreferenceUpdateRequest' }
              }
            }
          },
          responses: { 200: { description: 'Preferences updated' } }
        }
      },
      '/stream': {
        get: {
          tags: ['Realtime'],
          summary: 'Open an SSE stream',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'SSE stream opened' } }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
