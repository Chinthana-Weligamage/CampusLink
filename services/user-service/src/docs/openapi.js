function createOpenApi() {
  return {
    openapi: '3.0.4',
    info: {
      title: 'CampusLink User Service API',
      version: '1.0.0',
      description: 'Student registration, authentication, and profile management for SLIIT CampusLink.'
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Direct service access' },
      { url: 'http://localhost:8080/user', description: 'Gateway access' }
    ],
    tags: [
      { name: 'Health' },
      { name: 'Auth' },
      { name: 'Users' }
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
          responses: {
            200: { description: 'Healthy' }
          }
        }
      },
      '/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                example: {
                  studentNo: 'IT2026100',
                  fullName: 'Nethmi Silva',
                  email: 'nethmi@my.sliit.lk',
                  password: 'Student@123',
                  faculty: 'Computing',
                  specialization: 'Information Technology',
                  intakeYear: 2026,
                  defaultPickupStop: 'Makumbura'
                }
              }
            }
          },
          responses: {
            201: { description: 'User created' }
          }
        }
      },
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate a user',
          responses: {
            200: { description: 'Authenticated' }
          }
        }
      },
      '/me': {
        get: {
          tags: ['Users'],
          summary: 'Get the authenticated profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile returned' }
          }
        },
        patch: {
          tags: ['Users'],
          summary: 'Update the authenticated profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile updated' }
          }
        }
      },
      '/students/{studentId}': {
        get: {
          tags: ['Users'],
          summary: 'Get a student profile by id',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'studentId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Student returned' }
          }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
