const jwt = require('jsonwebtoken');
const { AppError } = require('@campuslink/shared');
const { env } = require('../config/env');

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'AUTH_REQUIRED', 'Authorization bearer token is required'));
  }

  try {
    req.auth = jwt.verify(header.slice('Bearer '.length), env.jwtSecret);
    return next();
  } catch (error) {
    return next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole
};
