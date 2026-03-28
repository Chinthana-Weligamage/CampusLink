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
      '/modules/{moduleCode}/assignments': {
        get: {
          tags: ['Assignments'],
          summary: 'List assignments for a module',
          responses: { 200: { description: 'Assignments returned' } }
        }
      },
      '/assignments/{assignmentId}': {
        get: {
          tags: ['Assignments'],
          summary: 'Get assignment details',
          responses: { 200: { description: 'Assignment returned' } }
        }
      },
      '/assignments': {
        post: {
          tags: ['Assignments'],
          summary: 'Create an assignment',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Assignment created' } }
        }
      },
      '/assignments/{assignmentId}/submissions': {
        post: {
          tags: ['Submissions'],
          summary: 'Create or replace a submission',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Submission recorded' } }
        }
      },
      '/students/{userId}/submissions': {
        get: {
          tags: ['Submissions'],
          summary: 'List student submissions',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Submissions returned' } }
        }
      }
    }
  };
}

module.exports = {
  createOpenApi
};
