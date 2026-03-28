const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError, postInternalEvent } = require('@campuslink/shared');
const { env } = require('../config/env');
const {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByStudentNo,
  insertAuthAudit,
  updateUser
} = require('../repositories/user-repository');
const { createId } = require('../utils/id');

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function issueToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      studentNo: user.studentNo,
      fullName: user.fullName
    },
    env.jwtSecret,
    { expiresIn: '8h' }
  );
}

async function emitNotificationEvent(event, logger) {
  try {
    await postInternalEvent(env.notificationServiceUrl, env.internalServiceToken, event, logger);
  } catch (error) {
    logger.warn('notification_emit_skipped', {
      eventType: event.eventType,
      reason: error.message
    });
  }
}

async function registerUser(payload, logger) {
  if (findUserByEmail(payload.email)) {
    throw new AppError(409, 'EMAIL_EXISTS', 'A user with this email already exists');
  }

  if (findUserByStudentNo(payload.studentNo)) {
    throw new AppError(409, 'STUDENT_EXISTS', 'A user with this student number already exists');
  }

  const now = new Date().toISOString();
  const user = createUser({
    id: createId('USR'),
    studentNo: payload.studentNo,
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: bcrypt.hashSync(payload.password, 10),
    role: payload.role === 'admin' ? 'admin' : 'student',
    faculty: payload.faculty,
    specialization: payload.specialization,
    intakeYear: payload.intakeYear,
    contactNo: payload.contactNo || null,
    defaultPickupStop: payload.defaultPickupStop || null,
    createdAt: now,
    updatedAt: now
  });

  insertAuthAudit({
    id: createId('AUD'),
    userId: user.id,
    action: 'register',
    detail: `Registered account for ${user.email}`,
    createdAt: now
  });

  await emitNotificationEvent({
    eventType: 'user.registered',
    sourceService: 'user-service',
    userId: user.id,
    title: 'Welcome to CampusLink',
    message: `Hi ${user.fullName}, your CampusLink account is ready.`,
    payload: {
      studentNo: user.studentNo
    },
    occurredAt: now
  }, logger);

  return {
    user: sanitizeUser(user),
    token: issueToken(user)
  };
}

function loginUser(payload) {
  const user = findUserByEmail(payload.email);

  if (!user || !bcrypt.compareSync(payload.password, user.passwordHash)) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  insertAuthAudit({
    id: createId('AUD'),
    userId: user.id,
    action: 'login',
    detail: `Successful login for ${user.email}`,
    createdAt: new Date().toISOString()
  });

  return {
    user: sanitizeUser(user),
    token: issueToken(user)
  };
}

function getProfile(userId) {
  const user = findUserById(userId);

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return sanitizeUser(user);
}

async function updateProfile(userId, payload, logger) {
  const updated = updateUser(userId, {
    ...payload,
    updatedAt: new Date().toISOString()
  });

  if (!updated) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  await emitNotificationEvent({
    eventType: 'user.profile.updated',
    sourceService: 'user-service',
    userId: updated.id,
    title: 'Profile updated',
    message: 'Your CampusLink profile was updated successfully.',
    payload: {
      defaultPickupStop: updated.defaultPickupStop
    },
    occurredAt: updated.updatedAt
  }, logger);

  return sanitizeUser(updated);
}

function getStudentById(studentId) {
  const user = findUserById(studentId);

  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return sanitizeUser(user);
}

module.exports = {
  getProfile,
  getStudentById,
  loginUser,
  registerUser,
  updateProfile
};
