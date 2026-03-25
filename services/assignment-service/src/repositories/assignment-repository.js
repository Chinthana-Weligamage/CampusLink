const { getDb } = require('../db/connection');

function listAssignmentsByModule(moduleCode) {
  return getDb().prepare(`
    SELECT assignments.*, modules.moduleName, modules.semester, modules.academicYear
    FROM assignments
    JOIN modules ON modules.moduleCode = assignments.moduleCode
    WHERE assignments.moduleCode = ?
    ORDER BY assignments.dueAt
  `).all(moduleCode);
}

function getAssignmentById(assignmentId) {
  return getDb().prepare(`
    SELECT assignments.*, modules.moduleName, modules.semester, modules.academicYear
    FROM assignments
    JOIN modules ON modules.moduleCode = assignments.moduleCode
    WHERE assignments.id = ?
  `).get(assignmentId);
}

function getModuleByCode(moduleCode) {
  return getDb().prepare('SELECT * FROM modules WHERE moduleCode = ?').get(moduleCode);
}

function createAssignment(assignment) {
  getDb().prepare(`
    INSERT INTO assignments (id, moduleCode, title, description, dueAt, createdBy, createdAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    assignment.id,
    assignment.moduleCode,
    assignment.title,
    assignment.description,
    assignment.dueAt,
    assignment.createdBy,
    assignment.createdAt,
    assignment.status
  );

  return getAssignmentById(assignment.id);
}

function upsertSubmission(submission) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM submissions WHERE assignmentId = ? AND userId = ?').get(
    submission.assignmentId,
    submission.userId
  );

  if (existing) {
    db.prepare(`
      UPDATE submissions
      SET submissionUrl = ?, notes = ?, submittedAt = ?, status = ?
      WHERE assignmentId = ? AND userId = ?
    `).run(
      submission.submissionUrl,
      submission.notes,
      submission.submittedAt,
      'resubmitted',
      submission.assignmentId,
      submission.userId
    );

    return db.prepare(`
      SELECT * FROM submissions WHERE assignmentId = ? AND userId = ?
    `).get(submission.assignmentId, submission.userId);
  }

  db.prepare(`
    INSERT INTO submissions (id, assignmentId, userId, submissionUrl, notes, submittedAt, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    submission.id,
    submission.assignmentId,
    submission.userId,
    submission.submissionUrl,
    submission.notes,
    submission.submittedAt,
    submission.status
  );

  return db.prepare('SELECT * FROM submissions WHERE id = ?').get(submission.id);
}

function listSubmissionsByUser(userId) {
  return getDb().prepare(`
    SELECT submissions.*, assignments.title, assignments.moduleCode, assignments.dueAt
    FROM submissions
    JOIN assignments ON assignments.id = submissions.assignmentId
    WHERE submissions.userId = ?
    ORDER BY submissions.submittedAt DESC
  `).all(userId);
}

module.exports = {
  createAssignment,
  getAssignmentById,
  getModuleByCode,
  listAssignmentsByModule,
  listSubmissionsByUser,
  upsertSubmission
};
