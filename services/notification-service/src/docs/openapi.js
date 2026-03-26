function createOpenApi() {
  return {
    openapi: '3.0.4',
    info: {
      title: 'CampusLink Notification Service API',
      version: '1.0.0',
      description: 'Notification storage, preferences, internal event ingestion, and SSE sync.'
    },
    servers: [
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
      '/internal/events': {
        post: {
          tags: ['Internal Events'],
          summary: 'Ingest an internal notification event',
          responses: { 201: { description: 'Event processed' } }
        }
      },
      '/users/{userId}/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'List notifications for a user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Notifications returned' } }
        }
      },
      '/notifications/{notificationId}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark a notification as read',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Notification updated' } }
        }
      },
      '/users/{userId}/notifications/read-all': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Notifications updated' } }
        }
      },
      '/users/{userId}/preferences': {
        put: {
          tags: ['Preferences'],
          summary: 'Update notification preferences',
          security: [{ bearerAuth: [] }],
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
