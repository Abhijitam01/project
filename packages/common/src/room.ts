import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name too long'),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Room = z.infer<typeof roomSchema>;
