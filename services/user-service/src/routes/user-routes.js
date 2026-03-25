const express = require('express');
const controller = require('../controllers/user-controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const {
  loginSchema,
  registrationSchema,
  updateProfileSchema
} = require('../schemas/user-schemas');

const router = express.Router();

router.get('/health', controller.health);
router.post('/register', validate(registrationSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.get('/me', requireAuth, controller.getMe);
router.patch('/me', requireAuth, validate(updateProfileSchema), controller.patchMe);
router.get('/students/:studentId', requireAuth, requireRole('admin', 'student'), controller.getStudent);

module.exports = router;
