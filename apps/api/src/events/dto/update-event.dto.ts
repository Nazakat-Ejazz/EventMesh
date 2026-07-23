import { z } from 'zod';
import { EventCategory } from '@eventmesh/shared-types';

export const UpdateEventSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  venue: z.string().min(3).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.nativeEnum(EventCategory).optional(),
  capacity: z.number().int().min(1).max(100000).optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateEventDTO = z.infer<typeof UpdateEventSchema>;
