const { getDb } = require('./connection');

function migrate() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      moduleCode TEXT PRIMARY KEY,
      moduleName TEXT NOT NULL,
      semester INTEGER NOT NULL,
      academicYear TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      moduleCode TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      dueAt TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (moduleCode) REFERENCES modules(moduleCode)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      userId TEXT NOT NULL,
      submissionUrl TEXT NOT NULL,
      notes TEXT,
      submittedAt TEXT NOT NULL,
      status TEXT NOT NULL,
      UNIQUE(assignmentId, userId),
      FOREIGN KEY (assignmentId) REFERENCES assignments(id)
    );
  `);
}

module.exports = {
  migrate
};
