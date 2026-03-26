const express = require('express');
const controller = require('../controllers/notification-controller');
const { requireAuth, requireInternalToken, requireSelfOrAdmin } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { eventSchema, preferenceSchema } = require('../schemas/notification-schemas');

const router = express.Router();

router.get('/health', controller.health);
router.post('/internal/events', requireInternalToken, validate(eventSchema), controller.ingestEvent);
router.get('/users/:userId/notifications', requireAuth, requireSelfOrAdmin, controller.getNotifications);
router.patch('/notifications/:notificationId/read', requireAuth, controller.markRead);
router.patch('/users/:userId/notifications/read-all', requireAuth, requireSelfOrAdmin, controller.markReadAll);
router.put('/users/:userId/preferences', requireAuth, requireSelfOrAdmin, validate(preferenceSchema), controller.putPreferences);
router.get('/stream', requireAuth, controller.stream);

module.exports = router;
