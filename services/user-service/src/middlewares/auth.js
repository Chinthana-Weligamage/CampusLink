const jwt = require('jsonwebtoken');
const { AppError } = require('@campuslink/shared');
const { env } = require('../config/env');

function extractToken(req) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Authorization bearer token is required');
  }

  return header.slice('Bearer '.length);
}

function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    req.auth = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
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
