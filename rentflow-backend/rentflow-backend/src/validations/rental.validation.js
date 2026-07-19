import { z } from 'zod';

export const itemIdParamSchema = z.object({
  itemId: z.string().uuid('Invalid item id'),
});
