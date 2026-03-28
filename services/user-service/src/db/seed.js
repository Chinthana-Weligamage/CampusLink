const bcrypt = require('bcryptjs');
const { getDb } = require('./connection');
const { createId } = require('../utils/id');

function seed() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

  if (count > 0) {
    return;
  }

  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO users (
      id, studentNo, fullName, email, passwordHash, role, faculty,
      specialization, intakeYear, contactNo, defaultPickupStop, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    createId('USR'),
    'IT000001',
    'Campus Admin',
    'admin@my.sliit.lk',
    bcrypt.hashSync('Admin@123', 10),
    'admin',
    'Computing',
    'Information Technology',
    2022,
    '0710000000',
    'SLIIT Malabe Main Gate',
    now,
    now
  );

  insert.run(
    createId('USR'),
    'IT2026001',
    'Demo Student',
    'student@my.sliit.lk',
    bcrypt.hashSync('Student@123', 10),
    'student',
    'Computing',
    'Information Technology',
    2026,
    '0771234567',
    'Kottawa',
    now,
    now
  );
}

module.exports = {
  seed
};
