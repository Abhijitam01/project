import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string(), 
  phone: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

export const userResponseSchema = userSchema.omit({ password: true });

export type UserResponse = z.infer<typeof userResponseSchema>;

export const authResponseSchema = z.object({
  token: z.string(),
  user: userResponseSchema,
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
