const { getDb } = require('../db/connection');

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    ...row
  };
}

function createUser(user) {
  const db = getDb();
  db.prepare(`
    INSERT INTO users (
      id, studentNo, fullName, email, passwordHash, role, faculty,
      specialization, intakeYear, contactNo, defaultPickupStop, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    user.id,
    user.studentNo,
    user.fullName,
    user.email,
    user.passwordHash,
    user.role,
    user.faculty,
    user.specialization,
    user.intakeYear,
    user.contactNo,
    user.defaultPickupStop,
    user.createdAt,
    user.updatedAt
  );

  return findUserById(user.id);
}

function findUserByEmail(email) {
  const db = getDb();
  return mapUser(db.prepare('SELECT * FROM users WHERE email = ?').get(email));
}

function findUserByStudentNo(studentNo) {
  const db = getDb();
  return mapUser(db.prepare('SELECT * FROM users WHERE studentNo = ?').get(studentNo));
}

function findUserById(id) {
  const db = getDb();
  return mapUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

function updateUser(id, payload) {
  const db = getDb();
  const current = findUserById(id);

  if (!current) {
    return null;
  }

  const next = {
    ...current,
    ...payload
  };

  db.prepare(`
    UPDATE users
    SET fullName = ?, faculty = ?, specialization = ?, intakeYear = ?, contactNo = ?,
        defaultPickupStop = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    next.fullName,
    next.faculty,
    next.specialization,
    next.intakeYear,
    next.contactNo,
    next.defaultPickupStop,
    next.updatedAt,
    id
  );

  return findUserById(id);
}

function insertAuthAudit(log) {
  const db = getDb();
  db.prepare(`
    INSERT INTO auth_audit_logs (id, userId, action, detail, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(log.id, log.userId, log.action, log.detail, log.createdAt);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByStudentNo,
  insertAuthAudit,
  updateUser
};
