const { z } = require('zod');

const registrationSchema = z.object({
  studentNo: z.string().min(4).max(20),
  fullName: z.string().min(3).max(120),
  email: z.string().email().regex(/@my\.sliit\.lk$/u, 'Email must use the my.sliit.lk domain'),
  password: z.string().min(8),
  faculty: z.string().min(2).max(100),
  specialization: z.string().min(2).max(100),
  intakeYear: z.number().int().min(2010).max(2100),
  contactNo: z.string().min(10).max(15).optional(),
  defaultPickupStop: z.string().min(2).max(100).optional(),
  role: z.enum(['student', 'admin']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const updateProfileSchema = z.object({
  fullName: z.string().min(3).max(120).optional(),
  faculty: z.string().min(2).max(100).optional(),
  specialization: z.string().min(2).max(100).optional(),
  intakeYear: z.number().int().min(2010).max(2100).optional(),
  contactNo: z.string().min(10).max(15).optional(),
  defaultPickupStop: z.string().min(2).max(100).optional()
}).refine((payload) => Object.keys(payload).length > 0, 'At least one field must be provided');

module.exports = {
  loginSchema,
  registrationSchema,
  updateProfileSchema
};
