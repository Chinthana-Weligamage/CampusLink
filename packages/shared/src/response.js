class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

function sendSuccess(res, data, statusCode = 200, meta = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta
  });
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: error.message || 'Unexpected error',
      details: error.details || undefined
    }
  });
}

function notFoundHandler(req, res) {
  return sendError(res, new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(logger) {
  return (error, req, res, next) => {
    logger.error('request_failed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });

    if (res.headersSent) {
      return next(error);
    }

    return sendError(res, error);
  };
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  sendError,
  sendSuccess
};
