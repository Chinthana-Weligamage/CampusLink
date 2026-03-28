const express = require('express');
const controller = require('../controllers/transport-controller');
const { requireAuth, requireRole } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { announcementSchema, bookingSchema } = require('../schemas/transport-schemas');

const router = express.Router();

router.get('/health', controller.health);
router.get('/routes', controller.getRoutes);
router.get('/routes/:routeId/schedules', controller.getSchedules);
router.post('/bookings', requireAuth, validate(bookingSchema), controller.createBooking);
router.get('/users/:userId/bookings', requireAuth, controller.getBookings);
router.patch('/bookings/:bookingId/cancel', requireAuth, controller.cancelBooking);
router.post('/announcements', requireAuth, requireRole('admin'), validate(announcementSchema), controller.createAnnouncement);

module.exports = router;
