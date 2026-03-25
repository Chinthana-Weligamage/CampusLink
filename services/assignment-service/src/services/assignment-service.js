const { AppError, postInternalEvent } = require('@campuslink/shared');
const { env } = require('../config/env');
const {
  createAssignment,
  getAssignmentById,
  getModuleByCode,
  listAssignmentsByModule,
  listSubmissionsByUser,
  upsertSubmission
} = require('../repositories/assignment-repository');
const { createId } = require('../utils/id');

async function emitEvent(event, logger) {
  try {
    await postInternalEvent(env.notificationServiceUrl, env.internalServiceToken, event, logger);
  } catch (error) {
    logger.warn('notification_emit_skipped', {
      eventType: event.eventType,
      reason: error.message
    });
  }
}

function getAssignmentsForModule(moduleCode) {
  return listAssignmentsByModule(moduleCode);
}

function getAssignment(assignmentId) {
  const assignment = getAssignmentById(assignmentId);

  if (!assignment) {
    throw new AppError(404, 'ASSIGNMENT_NOT_FOUND', 'Assignment not found');
  }

  return assignment;
}

async function createAssignmentRecord(user, payload, logger) {
  const module = getModuleByCode(payload.moduleCode);

  if (!module) {
    throw new AppError(404, 'MODULE_NOT_FOUND', 'Module not found');
  }

  const createdAt = new Date().toISOString();
  const assignment = createAssignment({
    id: createId('ASM'),
    moduleCode: payload.moduleCode,
    title: payload.title,
    description: payload.description,
    dueAt: payload.dueAt,
    createdBy: user.sub,
    createdAt,
    status: 'published'
  });

  await emitEvent({
    eventType: 'assignment.created',
    sourceService: 'assignment-service',
    userId: user.sub,
    title: `Assignment created: ${assignment.title}`,
    message: `A new ${assignment.moduleCode} assignment has been published.`,
    payload: {
      assignmentId: assignment.id,
      moduleCode: assignment.moduleCode
    },
    occurredAt: createdAt
  }, logger);

  return assignment;
}

async function submitAssignment(user, assignmentId, payload, logger) {
  const assignment = getAssignment(assignmentId);

  if (new Date(assignment.dueAt).getTime() < Date.now()) {
    throw new AppError(409, 'ASSIGNMENT_CLOSED', 'The assignment due time has passed');
  }

  const submission = upsertSubmission({
    id: createId('SUB'),
    assignmentId,
    userId: user.sub,
    submissionUrl: payload.submissionUrl,
    notes: payload.notes || null,
    submittedAt: new Date().toISOString(),
    status: 'submitted'
  });

  await emitEvent({
    eventType: 'assignment.submission.recorded',
    sourceService: 'assignment-service',
    userId: user.sub,
    title: 'Assignment submission recorded',
    message: `Your submission for ${assignment.title} has been recorded.`,
    payload: {
      assignmentId,
      submissionId: submission.id
    },
    occurredAt: submission.submittedAt
  }, logger);

  return submission;
}

function getSubmissionHistory(requestingUser, userId) {
  if (requestingUser.role !== 'admin' && requestingUser.sub !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only view your own submissions');
  }

  return listSubmissionsByUser(userId);
}

module.exports = {
  createAssignmentRecord,
  getAssignment,
  getAssignmentsForModule,
  getSubmissionHistory,
  submitAssignment
};
