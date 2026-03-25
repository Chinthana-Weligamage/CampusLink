const express = require('express');
const controller = require('../controllers/assignment-controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { assignmentSchema, submissionSchema } = require('../schemas/assignment-schemas');

const router = express.Router();

router.get('/health', controller.health);
router.get('/modules/:moduleCode/assignments', controller.getAssignments);
router.get('/assignments/:assignmentId', controller.getAssignment);
router.post('/assignments', requireAuth, requireRole('admin'), validate(assignmentSchema), controller.createAssignment);
router.post('/assignments/:assignmentId/submissions', requireAuth, validate(submissionSchema), controller.createSubmission);
router.get('/students/:userId/submissions', requireAuth, controller.getSubmissions);

module.exports = router;
