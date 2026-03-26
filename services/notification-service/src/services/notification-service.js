const { AppError } = require('@campuslink/shared');
const {
  createDeliveryLog,
  createNotification,
  getNotificationById,
  getPreferences,
  listNotificationsByUser,
  markAllNotificationsRead,
  markNotificationRead,
  updatePreferences
} = require('../repositories/notification-repository');
const { addClient, getClientCount, pushEvent, removeClient } = require('./stream-registry');
const { createId } = require('../utils/id');

function mapCategory(eventType) {
  if (eventType.startsWith('transport.')) {
    return 'transport';
  }

  if (eventType.startsWith('assignment.')) {
    return 'assignment';
  }

  return 'system';
}

function isCategoryEnabled(preferences, category) {
  if (category === 'transport') {
    return Boolean(preferences.transportEnabled);
  }

  if (category === 'assignment') {
    return Boolean(preferences.assignmentEnabled);
  }

  return Boolean(preferences.systemEnabled);
}

function getUserNotifications(userId, requestingUser) {
  if (requestingUser.role !== 'admin' && requestingUser.sub !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only access your own notifications');
  }

  return listNotificationsByUser(userId);
}

function updateUserPreferences(userId, requestingUser, payload) {
  if (requestingUser.role !== 'admin' && requestingUser.sub !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only update your own notification preferences');
  }

  return updatePreferences(userId, payload);
}

function markSingleRead(notificationId, requestingUser) {
  const notification = getNotificationById(notificationId);

  if (!notification) {
    throw new AppError(404, 'NOTIFICATION_NOT_FOUND', 'Notification not found');
  }

  if (requestingUser.role !== 'admin' && requestingUser.sub !== notification.userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only update your own notifications');
  }

  return markNotificationRead(notificationId);
}

function markAllRead(userId, requestingUser) {
  if (requestingUser.role !== 'admin' && requestingUser.sub !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only update your own notifications');
  }

  return markAllNotificationsRead(userId);
}

function ingestEvent(payload, logger) {
  const category = mapCategory(payload.eventType);
  const preferences = getPreferences(payload.userId);

  if (!isCategoryEnabled(preferences, category)) {
    createDeliveryLog({
      id: createId('DLV'),
      notificationId: null,
      deliveryChannel: 'preference-filter',
      status: 'suppressed',
      details: `Suppressed ${category} notification`,
      deliveredAt: new Date().toISOString()
    });

    return {
      stored: false,
      reason: 'suppressed_by_preferences'
    };
  }

  const notification = createNotification({
    id: createId('NTF'),
    userId: payload.userId,
    category,
    eventType: payload.eventType,
    sourceService: payload.sourceService,
    title: payload.title,
    message: payload.message,
    payload: payload.payload,
    createdAt: payload.occurredAt
  });

  createDeliveryLog({
    id: createId('DLV'),
    notificationId: notification.id,
    deliveryChannel: 'store',
    status: 'stored',
    details: 'Notification persisted',
    deliveredAt: new Date().toISOString()
  });

  const pushed = pushEvent(notification.userId, 'notification.created', notification, logger);

  createDeliveryLog({
    id: createId('DLV'),
    notificationId: notification.id,
    deliveryChannel: 'sse',
    status: pushed > 0 ? 'delivered' : 'pending',
    details: `Recipients: ${pushed}`,
    deliveredAt: new Date().toISOString()
  });

  return {
    stored: true,
    notification
  };
}

function openStream(user, req, res, logger) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  addClient(user.sub, res);

  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ userId: user.sub, activeStreams: getClientCount(user.sub) })}\n\n`);

  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\n`);
    res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(user.sub, res);
    logger.info('sse_disconnected', {
      userId: user.sub,
      activeStreams: getClientCount(user.sub)
    });
  });
}

module.exports = {
  getUserNotifications,
  ingestEvent,
  markAllRead,
  markSingleRead,
  openStream,
  updateUserPreferences
};
