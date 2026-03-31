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
const transportRoutes = require('./routes/transport-routes');
const { createOpenApi } = require('./docs/openapi');

function createApp() {
  const app = express();
  const logger = createLogger('transport-service');
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
  app.use('/docs', (req, res, next) => {
    const requestPath = req.originalUrl.split('?')[0];

    if (requestPath === '/docs') {
      const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
      return res.redirect(301, `/docs/${query}`);
    }

    return next();
  }, swaggerUi.serve, swaggerUi.setup(openApi));
  app.use('/', transportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler(logger));

  return app;
}

module.exports = {
  createApp
};
