import 'server-only'

import { z } from 'zod'

const skipValidation =
  process.env.SKIP_ENV_VALIDATION === '1' || process.env.SKIP_ENV_VALIDATION === 'true'

/**
 * Server-side environment, validated once at module load so a missing or
 * malformed variable fails fast and loud instead of at the first request.
 *
 * This module is `server-only`: importing it from a Client Component is a build
 * error, so secrets can never leak into the client bundle. A build/CI run
 * without a database can set `SKIP_ENV_VALIDATION=1`.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_URL: z.string().url().default('http://localhost:3000'),

  // Database (Neon).
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),

  // Auth — required from Phase 1 on.
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // Email + OAuth — wired as those integrations land (Phase 1).
  GITHUB_OAUTH_CLIENT_ID: z.string().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Flag pepper — required from Phase 2 (challenges) on.
  FLAG_PEPPER: z.string().min(16),

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

/**
 * Treat empty-string env vars as unset, so a stray `KEY=` in a `.env`
 * (e.g. copied from `.env.example`) doesn't fail an otherwise-optional check.
 */
function clean(source: NodeJS.ProcessEnv): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(source)) {
    out[key] = value === '' ? undefined : value
  }
  return out
}

function loadEnv(): ServerEnv {
  if (skipValidation) {
    return process.env as unknown as ServerEnv
  }

  const parsed = serverSchema.safeParse(clean(process.env))
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
