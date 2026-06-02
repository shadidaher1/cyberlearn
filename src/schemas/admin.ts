import { z } from 'zod'

export const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD', 'INSANE'])

export const adminChallengeCreateSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(20_000),
  owaspRef: z.string().trim().max(120).optional(),
  categorySlug: z.string().trim().min(1),
  difficulty: difficultyEnum,
  points: z.coerce.number().int().min(0).max(10_000),
  flag: z.string().trim().min(1).max(256),
  published: z.coerce.boolean().optional().default(false),
})

export const adminChallengeUpdateSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(10).max(20_000).optional(),
  owaspRef: z.string().trim().max(120).optional(),
  categorySlug: z.string().trim().min(1).optional(),
  difficulty: difficultyEnum.optional(),
  points: z.coerce.number().int().min(0).max(10_000).optional(),
  flag: z.string().trim().min(1).max(256).optional(),
  published: z.coerce.boolean().optional(),
})

export type AdminChallengeCreate = z.infer<typeof adminChallengeCreateSchema>
export type AdminChallengeUpdate = z.infer<typeof adminChallengeUpdateSchema>
