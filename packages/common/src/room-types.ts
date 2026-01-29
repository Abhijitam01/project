import { z } from "zod";

// Database model types based on Prisma schema
export interface User {
  id: string;
  createdAt: Date;
  email: string;
  username: string;
  password: string;
  room: Room[];
  shapes: Shape[];
}

export interface Room {
  id: number;
  roomName: string;
  userId: string;
  user: User;
  shape: Shape[];
}

export interface Shape {
  id: number;
  roomId: number;
  data: string;
  userId: string;
  room: Room;
  user: User;
}

// API response types (without sensitive data)
export interface UserResponse {
  id: string;
  email: string;
  username: string;
  room: Room[];
  shapes: Shape[];
}

export interface RoomResponse {
  id: number;
  roomName: string;
  userId: string;
  shape: Shape[];
}

// Validation schemas
export const RegisterSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required"
  })
  .max(20, {
    message: "Username exceeds 20 characters!"
  }),

  email: z.string().email({ message: "Invalid Email" }),
  password: z.string().min(6, { message: "Password must exceed 6 characters!" })
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const CreateRoomSchema = z.object({
  roomName: z.string().min(1, {
    message: "RoomName is required!"
  })
});
