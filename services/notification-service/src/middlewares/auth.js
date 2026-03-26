const jwt = require('jsonwebtoken');
const { AppError } = require('@campuslink/shared');
const { env } = require('../config/env');

function getBearerToken(req) {
  if (req.query.token) {
    return req.query.token;
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Authorization bearer token is required');
  }

  return header.slice('Bearer '.length);
}

function requireAuth(req, res, next) {
  try {
    req.auth = jwt.verify(getBearerToken(req), env.jwtSecret);
    return next();
  } catch (error) {
    return next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
  }
}

function requireSelfOrAdmin(req, res, next) {
  if (req.auth.role === 'admin' || req.auth.sub === req.params.userId) {
    return next();
  }

  return next(new AppError(403, 'FORBIDDEN', 'You can only access your own notifications'));
}

function requireInternalToken(req, res, next) {
  const header = req.headers.authorization;

  if (header !== `Bearer ${env.internalServiceToken}`) {
    return next(new AppError(401, 'INVALID_INTERNAL_TOKEN', 'Valid internal service token is required'));
  }

  return next();
}

module.exports = {
  requireAuth,
  requireInternalToken,
  requireSelfOrAdmin
};
