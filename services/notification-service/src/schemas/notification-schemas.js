const { z } = require('zod');

const eventSchema = z.object({
  eventType: z.string().min(3),
  sourceService: z.string().min(3),
  userId: z.string().min(3),
  title: z.string().min(3).max(120),
  message: z.string().min(3).max(500),
  payload: z.record(z.any()).default({}),
  occurredAt: z.string().datetime({ offset: true })
});

const preferenceSchema = z.object({
  transportEnabled: z.boolean().optional(),
  assignmentEnabled: z.boolean().optional(),
  systemEnabled: z.boolean().optional()
}).refine((payload) => Object.keys(payload).length > 0, 'At least one preference flag must be provided');

module.exports = {
  eventSchema,
  preferenceSchema
};
