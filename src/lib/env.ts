import 'server-only'

import { z } from 'zod'

const skipValidation =
  process.env.SKIP_ENV_VALIDATION === '1' || process.env.SKIP_ENV_VALIDATION === 'true'

/**
 * Server-side environment, validated once at module load so a missing or
 * malformed variable fails fast and loud instead of at the first request.
 *
 * Variables introduced by later phases are `.optional()` for now and become
 * required in the phase that uses them (see docs/SECURITY.md). A build or CI
 * run without a database can set `SKIP_ENV_VALIDATION=1`.
 *
 * This module is `server-only`: importing it from a Client Component is a build
 * error, so secrets can never leak into the client bundle.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database (Neon) — required at runtime.
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Phase 1 — auth & email.
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  FLAG_PEPPER: z.string().min(16).optional(),
  GITHUB_OAUTH_CLIENT_ID: z.string().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Rate limiting (Upstash Redis).
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Phase 5 — realtime (Pusher).
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),

  // Phase 6 — AI mentor.
  ANTHROPIC_API_KEY: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverSchema>

function loadEnv(): ServerEnv {
  if (skipValidation) {
    return process.env as unknown as ServerEnv
  }

  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error(
      '❌ Invalid server environment variables:',
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    )
    throw new Error('Invalid server environment. See .env.example and docs/SECURITY.md.')
  }

  return parsed.data
}

export const env = loadEnv()
