const { getDb } = require('./connection');

function migrate() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS routes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      routeId TEXT NOT NULL,
      departureTime TEXT NOT NULL,
      arrivalTime TEXT NOT NULL,
      travelDate TEXT NOT NULL,
      totalSeats INTEGER NOT NULL,
      availableSeats INTEGER NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (routeId) REFERENCES routes(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      scheduleId TEXT NOT NULL,
      userId TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      cancelledAt TEXT,
      FOREIGN KEY (scheduleId) REFERENCES schedules(id)
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      routeId TEXT,
      targetUserId TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (routeId) REFERENCES routes(id)
    );
  `);
}

module.exports = {
  migrate
};
