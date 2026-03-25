const { sendSuccess } = require('@campuslink/shared');
const assignmentService = require('../services/assignment-service');

function health(req, res) {
  return sendSuccess(res, {
    service: 'assignment-service',
    status: 'ok',
    time: new Date().toISOString()
  });
}

function getAssignments(req, res, next) {
  try {
    return sendSuccess(res, assignmentService.getAssignmentsForModule(req.params.moduleCode));
  } catch (error) {
    return next(error);
  }
}

function getAssignment(req, res, next) {
  try {
    return sendSuccess(res, assignmentService.getAssignment(req.params.assignmentId));
  } catch (error) {
    return next(error);
  }
}

async function createAssignment(req, res, next) {
  try {
    const assignment = await assignmentService.createAssignmentRecord(req.auth, req.body, req.logger);
    return sendSuccess(res, assignment, 201);
  } catch (error) {
    return next(error);
  }
}

async function createSubmission(req, res, next) {
  try {
    const submission = await assignmentService.submitAssignment(req.auth, req.params.assignmentId, req.body, req.logger);
    return sendSuccess(res, submission, 201);
  } catch (error) {
    return next(error);
  }
}

function getSubmissions(req, res, next) {
  try {
    return sendSuccess(res, assignmentService.getSubmissionHistory(req.auth, req.params.userId));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAssignment,
  createSubmission,
  getAssignment,
  getAssignments,
  getSubmissions,
  health
};
