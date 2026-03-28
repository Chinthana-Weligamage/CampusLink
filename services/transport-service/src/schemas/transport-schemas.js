const { z } = require('zod');

const bookingSchema = z.object({
  scheduleId: z.string().min(4)
});

const announcementSchema = z.object({
  routeId: z.string().min(4).optional(),
  targetUserId: z.string().min(4).optional(),
  title: z.string().min(3).max(120),
  message: z.string().min(5).max(500),
  type: z.enum(['delay', 'cancellation', 'general'])
});

module.exports = {
  announcementSchema,
  bookingSchema
};
