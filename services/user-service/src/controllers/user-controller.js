const { sendSuccess } = require('@campuslink/shared');
const userService = require('../services/user-service');

async function register(req, res, next) {
  try {
    const result = await userService.registerUser(req.body, req.logger);
    return sendSuccess(res, result, 201);
  } catch (error) {
    return next(error);
  }
}

function login(req, res, next) {
  try {
    const result = userService.loginUser(req.body);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

function getMe(req, res, next) {
  try {
    const user = userService.getProfile(req.auth.sub);
    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
}

async function patchMe(req, res, next) {
  try {
    const user = await userService.updateProfile(req.auth.sub, req.body, req.logger);
    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
}

function getStudent(req, res, next) {
  try {
    const user = userService.getStudentById(req.params.studentId);
    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
}

function health(req, res) {
  return sendSuccess(res, {
    service: 'user-service',
    status: 'ok',
    time: new Date().toISOString()
  });
}

module.exports = {
  getMe,
  getStudent,
  health,
  login,
  patchMe,
  register
};
