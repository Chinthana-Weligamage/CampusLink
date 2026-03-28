const { getDb } = require('./connection');

function migrate() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      category TEXT NOT NULL,
      eventType TEXT NOT NULL,
      sourceService TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      payloadJson TEXT NOT NULL,
      isRead INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      readAt TEXT
    );

    CREATE TABLE IF NOT EXISTS preferences (
      userId TEXT PRIMARY KEY,
      transportEnabled INTEGER NOT NULL DEFAULT 1,
      assignmentEnabled INTEGER NOT NULL DEFAULT 1,
      systemEnabled INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS delivery_logs (
      id TEXT PRIMARY KEY,
      notificationId TEXT,
      deliveryChannel TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      deliveredAt TEXT NOT NULL,
      FOREIGN KEY (notificationId) REFERENCES notifications(id)
    );
  `);
}

module.exports = {
  migrate
};
