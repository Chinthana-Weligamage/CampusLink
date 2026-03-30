function createOpenApi() {
  return {
    openapi: '3.0.4',
    info: {
      title: 'CampusLink Assignment Service API',
      version: '1.0.0',
      description: 'Modules, assignments, and submission tracking for CampusLink.'
    },
    servers: [
      { url: 'http://localhost:3003', description: 'Direct service access' },
      { url: 'http://localhost:8080/assignment', description: 'Gateway access' }
    ],
    tags: [
      { name: 'Health' },
      { name: 'Assignments' },
      { name: 'Submissions' }
    ],
    components: {
      parameters: {
        moduleCode: {
          name: 'moduleCode',
          in: 'path',
          required: true,
          description: 'Module code to look up assignments for.',
          schema: {
            type: 'string',
            example: 'IT4020'
          }
        },
        assignmentId: {
          name: 'assignmentId',
          in: 'path',
          required: true,
          description: 'Assignment identifier.',
          schema: {
            type: 'string',
            example: 'ASM-001'
          }
        },
        userId: {
          name: 'userId',
          in: 'path',
          required: true,
          description: 'Student user identifier.',
          schema: {
            type: 'string',
            example: 'USR-001'
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
        AssignmentRequest: {
          type: 'object',
          required: ['moduleCode', 'title', 'description', 'dueAt'],
          properties: {
            moduleCode: { type: 'string', example: 'IT4020' },
            title: { type: 'string', example: 'CampusLink Service Design Review' },
            description: { type: 'string', example: 'Submit the architecture and API review summary.' },
            dueAt: { type: 'string', format: 'date-time', example: '2026-04-05T23:59:00+05:30' }
          }
        },
        SubmissionRequest: {
          type: 'object',
          required: ['submissionUrl'],
          properties: {
            submissionUrl: { type: 'string', format: 'uri', example: 'https://github.com/example/campuslink-report' },
            notes: { type: 'string', example: 'Updated version with API catalog.' }
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
      '/modules/{moduleCode}/assignments': {
        get: {
          tags: ['Assignments'],
          summary: 'List assignments for a module',
          parameters: [
            { $ref: '#/components/parameters/moduleCode' }
          ],
          responses: { 200: { description: 'Assignments returned' } }
        }
      },
      '/assignments/{assignmentId}': {
        get: {
          tags: ['Assignments'],
          summary: 'Get assignment details',
          parameters: [
            { $ref: '#/components/parameters/assignmentId' }
          ],
          responses: { 200: { description: 'Assignment returned' } }
        }
      },
      '/assignments': {
        post: {
          tags: ['Assignments'],
          summary: 'Create an assignment',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AssignmentRequest' }
              }
            }
          },
          responses: { 201: { description: 'Assignment created' } }
        }
      },
      '/assignments/{assignmentId}/submissions': {
        post: {
          tags: ['Submissions'],
          summary: 'Create or replace a submission',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/assignmentId' }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubmissionRequest' }
              }
            }
          },
          responses: { 201: { description: 'Submission recorded' } }
        }
      },
      '/students/{userId}/submissions': {
        get: {
          tags: ['Submissions'],
          summary: 'List student submissions',
          security: [{ bearerAuth: [] }],
          parameters: [
            { $ref: '#/components/parameters/userId' }
          ],
          responses: { 200: { description: 'Submissions returned' } }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
