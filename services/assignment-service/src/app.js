const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const {
  createLogger,
  errorHandler,
  notFoundHandler,
  requestIdMiddleware
} = require('@campuslink/shared');
const assignmentRoutes = require('./routes/assignment-routes');
const { createOpenApi } = require('./docs/openapi');

function createApp() {
  const app = express();
  const logger = createLogger('assignment-service');
  const openApi = createOpenApi();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware(logger));
  app.use((req, res, next) => {
    req.logger = logger;
    next();
  });

  app.get('/openapi.json', (req, res) => res.json(openApi));
  app.get('/docs', (req, res) => res.redirect(301, '/docs/'));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApi));
  app.use('/', assignmentRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}

module.exports = {
  createApp
};
