const { z } = require('zod');

const assignmentSchema = z.object({
  moduleCode: z.string().min(4).max(20),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  dueAt: z.string().datetime({ offset: true })
});

const submissionSchema = z.object({
  submissionUrl: z.string().url(),
  notes: z.string().max(500).optional()
});

module.exports = {
  assignmentSchema,
  submissionSchema
};
