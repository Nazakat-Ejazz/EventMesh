import { z } from 'zod';
import { EventCategory } from '@eventmesh/shared-types';

export const CreateEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  venue: z.string().min(3),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  category: z.nativeEnum(EventCategory),
  capacity: z.number().int().min(1).max(100000),
  imageUrl: z.string().url().optional(),
});

export type CreateEventDTO = z.infer<typeof CreateEventSchema>;
