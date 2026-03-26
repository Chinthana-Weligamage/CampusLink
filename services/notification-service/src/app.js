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
const notificationRoutes = require('./routes/notification-routes');
const { createOpenApi } = require('./docs/openapi');

function createApp() {
  const app = express();
  const logger = createLogger('notification-service');
  const openApi = createOpenApi();

  app.use(helmet({
    contentSecurityPolicy: false
  }));
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware(logger));
  app.use((req, res, next) => {
    req.logger = logger;
    next();
  });

  app.get('/openapi.json', (req, res) => res.json(openApi));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApi));
  app.use('/', notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}

module.exports = {
  createApp
};
