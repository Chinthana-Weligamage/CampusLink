const { sendSuccess } = require('@campuslink/shared');
const notificationService = require('../services/notification-service');

function health(req, res) {
  return sendSuccess(res, {
    service: 'notification-service',
    status: 'ok',
    time: new Date().toISOString()
  });
}

function ingestEvent(req, res, next) {
  try {
    return sendSuccess(res, notificationService.ingestEvent(req.body, req.logger), 201);
  } catch (error) {
    return next(error);
  }
}

function getNotifications(req, res, next) {
  try {
    return sendSuccess(res, notificationService.getUserNotifications(req.params.userId, req.auth));
  } catch (error) {
    return next(error);
  }
}

function markRead(req, res, next) {
  try {
    return sendSuccess(res, notificationService.markSingleRead(req.params.notificationId, req.auth));
  } catch (error) {
    return next(error);
  }
}

function markReadAll(req, res, next) {
  try {
    return sendSuccess(res, notificationService.markAllRead(req.params.userId, req.auth));
  } catch (error) {
    return next(error);
  }
}

function putPreferences(req, res, next) {
  try {
    return sendSuccess(res, notificationService.updateUserPreferences(req.params.userId, req.auth, req.body));
  } catch (error) {
    return next(error);
  }
}

function stream(req, res, next) {
  try {
    notificationService.openStream(req.auth, req, res, req.logger);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getNotifications,
  health,
  ingestEvent,
  markRead,
  markReadAll,
  putPreferences,
  stream
};
