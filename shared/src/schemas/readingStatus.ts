import { z } from 'zod';

export const setReadingStatusSchema = z.object({
  status: z.enum(['READING', 'COMPLETED']),
});

export type SetReadingStatusInput = z.infer<typeof setReadingStatusSchema>;
