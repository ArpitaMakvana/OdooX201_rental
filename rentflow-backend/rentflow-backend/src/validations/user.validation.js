import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: 'Provide at least one field to update (name or email).',
  });

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user id'),
});
