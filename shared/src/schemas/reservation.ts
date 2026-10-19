import { z } from 'zod';

export const createReservationSchema = z.object({
  workKey: z
    .string()
    .trim()
    .regex(/^OL\d+W$/, 'Invalid work key format'),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
