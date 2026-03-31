function createOpenApi() {
  return {
    openapi: '3.0.4',
    info: {
      title: 'CampusLink User Service API',
      version: '1.0.0',
      description: 'Student registration, authentication, and profile management for SLIIT CampusLink.'
    },
    servers: [
      { url: './', description: 'Current access path (direct or gateway)' },
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
      },
      schemas: {
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'USR-a1b2c3d4' },
            studentNo: { type: 'string', example: 'IT2026100' },
            fullName: { type: 'string', example: 'Nethmi Silva' },
            email: { type: 'string', format: 'email', example: 'nethmi@my.sliit.lk' },
            role: { type: 'string', example: 'student' },
            faculty: { type: 'string', example: 'Computing' },
            specialization: { type: 'string', example: 'Information Technology' },
            intakeYear: { type: 'integer', example: 2026 },
            contactNo: { type: 'string', nullable: true, example: '0771234567' },
            defaultPickupStop: { type: 'string', nullable: true, example: 'Makumbura' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['studentNo', 'fullName', 'email', 'password', 'faculty', 'specialization', 'intakeYear'],
          properties: {
            studentNo: { type: 'string', example: 'IT2026100' },
            fullName: { type: 'string', example: 'Nethmi Silva' },
            email: { type: 'string', format: 'email', example: 'nethmi@my.sliit.lk' },
            password: { type: 'string', format: 'password', example: 'Student@123' },
            faculty: { type: 'string', example: 'Computing' },
            specialization: { type: 'string', example: 'Information Technology' },
            intakeYear: { type: 'integer', example: 2026 },
            contactNo: { type: 'string', example: '0771234567' },
            defaultPickupStop: { type: 'string', example: 'Makumbura' },
            role: { type: 'string', enum: ['student', 'admin'], example: 'student' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'student@my.sliit.lk' },
            password: { type: 'string', format: 'password', example: 'Student@123' }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            fullName: { type: 'string', example: 'Nethmi Silva' },
            faculty: { type: 'string', example: 'Computing' },
            specialization: { type: 'string', example: 'Information Technology' },
            intakeYear: { type: 'integer', example: 2026 },
            contactNo: { type: 'string', example: '0771234567' },
            defaultPickupStop: { type: 'string', example: 'Kottawa' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserProfile' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
              }
            },
            meta: {
              type: 'object',
              example: {}
            }
          }
        },
        UserResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/UserProfile' },
            meta: {
              type: 'object',
              example: {}
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Request validation failed' }
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
                schema: { $ref: '#/components/schemas/RegisterRequest' }
              }
            }
          },
          responses: {
            201: {
              description: 'User created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            422: {
              description: 'Validation failed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Authenticated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' }
                }
              }
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' }
                }
              }
            }
          }
        }
      },
      '/me': {
        get: {
          tags: ['Users'],
          summary: 'Get the authenticated profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Profile returned',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserResponse' }
                }
              }
            }
          }
        },
        patch: {
          tags: ['Users'],
          summary: 'Update the authenticated profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
              }
            }
          },
          responses: {
            200: {
              description: 'Profile updated',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserResponse' }
                }
              }
            }
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
            200: {
              description: 'Student returned',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserResponse' }
                }
              }
            }
          }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
