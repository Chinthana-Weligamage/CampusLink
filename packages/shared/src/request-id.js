const { randomUUID } = require('node:crypto');

function requestIdMiddleware(logger) {
  return (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || randomUUID();
    res.setHeader('x-request-id', req.requestId);

    const startedAt = Date.now();
    logger.info('request_started', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl
    });

    res.on('finish', () => {
      logger.info('request_finished', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      });
    });

    next();
  };
}

module.exports = {
  requestIdMiddleware
};
