const { getDb } = require('../db/connection');

function ensurePreferences(userId) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM preferences WHERE userId = ?').get(userId);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO preferences (userId, transportEnabled, assignmentEnabled, systemEnabled, createdAt, updatedAt)
    VALUES (?, 1, 1, 1, ?, ?)
  `).run(userId, now, now);

  return db.prepare('SELECT * FROM preferences WHERE userId = ?').get(userId);
}

function getPreferences(userId) {
  return ensurePreferences(userId);
}

function updatePreferences(userId, payload) {
  const current = ensurePreferences(userId);
  const next = {
    transportEnabled: payload.transportEnabled ?? current.transportEnabled,
    assignmentEnabled: payload.assignmentEnabled ?? current.assignmentEnabled,
    systemEnabled: payload.systemEnabled ?? current.systemEnabled,
    updatedAt: new Date().toISOString()
  };

  getDb().prepare(`
    UPDATE preferences
    SET transportEnabled = ?, assignmentEnabled = ?, systemEnabled = ?, updatedAt = ?
    WHERE userId = ?
  `).run(
    Number(next.transportEnabled),
    Number(next.assignmentEnabled),
    Number(next.systemEnabled),
    next.updatedAt,
    userId
  );

  return getPreferences(userId);
}

function createNotification(notification) {
  getDb().prepare(`
    INSERT INTO notifications (
      id, userId, category, eventType, sourceService, title, message, payloadJson, isRead, createdAt, readAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    notification.id,
    notification.userId,
    notification.category,
    notification.eventType,
    notification.sourceService,
    notification.title,
    notification.message,
    JSON.stringify(notification.payload || {}),
    0,
    notification.createdAt,
    null
  );

  return getNotificationById(notification.id);
}

function listNotificationsByUser(userId) {
  return getDb().prepare(`
    SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC
  `).all(userId).map(mapNotification);
}

function getNotificationById(notificationId) {
  const row = getDb().prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId);
  return mapNotification(row);
}

function markNotificationRead(notificationId) {
  const readAt = new Date().toISOString();
  getDb().prepare(`
    UPDATE notifications SET isRead = 1, readAt = ? WHERE id = ?
  `).run(readAt, notificationId);

  return getNotificationById(notificationId);
}

function markAllNotificationsRead(userId) {
  const readAt = new Date().toISOString();
  getDb().prepare(`
    UPDATE notifications SET isRead = 1, readAt = ? WHERE userId = ? AND isRead = 0
  `).run(readAt, userId);

  return listNotificationsByUser(userId);
}

function createDeliveryLog(log) {
  getDb().prepare(`
    INSERT INTO delivery_logs (id, notificationId, deliveryChannel, status, details, deliveredAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    log.id,
    log.notificationId || null,
    log.deliveryChannel,
    log.status,
    log.details || null,
    log.deliveredAt
  );
}

function mapNotification(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    isRead: Boolean(row.isRead),
    payload: JSON.parse(row.payloadJson)
  };
}

module.exports = {
  createDeliveryLog,
  createNotification,
  getNotificationById,
  getPreferences,
  listNotificationsByUser,
  markAllNotificationsRead,
  markNotificationRead,
  updatePreferences
};
