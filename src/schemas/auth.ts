import { z } from 'zod'

// Shared between client forms and route handlers — one source of truth.

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email').max(254)

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'At least 3 characters')
  .max(24, 'At most 24 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only')

export const passwordSchema = z
  .string()
  .min(10, 'Use at least 10 characters')
  .max(200, 'At most 200 characters')

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
