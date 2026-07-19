import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user id'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['admin', 'user'], { errorMap: () => ({ message: "role must be 'admin' or 'user'" }) }),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'pending'], {
    errorMap: () => ({ message: "status must be 'active', 'suspended', or 'pending'" }),
  }),
});

export const lateFeePolicySchema = z.object({
  gracePeriodMinutes: z.number().int().min(0).max(1440),
  hourlyRate: z.number().min(0),
  dailyMaxLimit: z.number().min(0),
  roundingLogic: z.enum(['nearest_hour', 'nearest_15', 'exact']),
  autoLockAtAmount: z.number().min(0),
  autoLockEnabled: z.boolean(),
  legalAutoDraftEnabled: z.boolean(),
});
