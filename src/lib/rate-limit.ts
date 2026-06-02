import 'server-only'

/**
 * Fixed-window rate limiter.
 *
 * This in-memory implementation is a **development fallback** — it does not work
 * across serverless instances. Production uses Upstash Redis (durable,
 * serverless-safe); when `UPSTASH_*` env is configured, swap this module's
 * internals for `@upstash/ratelimit`. The async signature is already
 * Upstash-shaped so call sites won't change. See docs/SECURITY.md.
 */
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  existing.count += 1
  return {
    success: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  }
}
