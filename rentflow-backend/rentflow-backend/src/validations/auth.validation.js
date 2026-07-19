import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  // `role` is intentionally accepted-but-ignored: it's part of the
  // frontend's RegisterPayload type, but the server never trusts a
  // client-supplied role. Every self-registration becomes a plain USER —
  // see src/services/auth.service.js.
  role: z.enum(['admin', 'user']).optional(),
});

export const loginSchema = z.object({
  branch: z.string().trim().min(1, 'Please select a branch'),
  identifier: z.string().trim().min(1, 'Email or employee ID is required'),
  password: z.string().min(1, 'Password is required'),
});
