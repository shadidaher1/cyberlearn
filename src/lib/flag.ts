import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '@/lib/env'

/**
 * Flag handling — see docs/SECURITY.md §3.
 *
 * Flags are stored as `HMAC-SHA256(normalize(flag), FLAG_PEPPER)` (hex), never
 * plaintext. HMAC (keyed by a server-side pepper) gives rainbow-table / pre-image
 * resistance cheaply enough to run on every submission under rate limiting —
 * unlike argon2, which is deliberately slow and would add a DoS surface here.
 * Comparison is constant-time to avoid timing oracles. The flag (or a winning
 * attempt) never appears in any response, log, or error.
 */

/** Normalize a flag before hashing/comparison: trim surrounding whitespace. */
function normalize(flag: string): string {
  return flag.trim()
}

export function hashFlag(flag: string): string {
  return createHmac('sha256', env.FLAG_PEPPER).update(normalize(flag)).digest('hex')
}

/** Constant-time check of a submitted flag against a stored HMAC hash. */
export function verifyFlag(submitted: string, storedHash: string): boolean {
  const computed = Buffer.from(hashFlag(submitted), 'hex')
  let stored: Buffer
  try {
    stored = Buffer.from(storedHash, 'hex')
  } catch {
    return false
  }
  if (computed.length !== stored.length || stored.length === 0) return false
  return timingSafeEqual(computed, stored)
}
