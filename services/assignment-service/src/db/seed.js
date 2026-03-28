const { getDb } = require('./connection');
const { createId } = require('../utils/id');

function seed() {
  const db = getDb();
  const moduleCount = db.prepare('SELECT COUNT(*) AS count FROM modules').get().count;

  if (moduleCount === 0) {
    const insert = db.prepare(`
      INSERT INTO modules (moduleCode, moduleName, semester, academicYear)
      VALUES (?, ?, ?, ?)
    `);

    insert.run('IT4020', 'Modern Topics in IT', 2, '2025/2026');
    insert.run('SE4030', 'Software Engineering Project', 2, '2025/2026');
    insert.run('IE4010', 'Enterprise Integration', 2, '2025/2026');
  }

  const assignmentCount = db.prepare('SELECT COUNT(*) AS count FROM assignments').get().count;

  if (assignmentCount === 0) {
    db.prepare(`
      INSERT INTO assignments (id, moduleCode, title, description, dueAt, createdBy, createdAt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      createId('ASM'),
      'IT4020',
      'CampusLink Service Design Review',
      'Submit the architecture and API review summary for the microservices MVP.',
      '2026-04-05T23:59:00+05:30',
      'USR-ADMIN',
      new Date().toISOString(),
      'published'
    );
  }
}

module.exports = {
  seed
};
