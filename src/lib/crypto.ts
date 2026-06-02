import 'server-only'

import { hash, verify } from '@node-rs/argon2'
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * argon2id parameters. `@node-rs/argon2` defaults to Argon2id; the cost params
 * below follow OWASP guidance for interactive logins (≈19 MiB, 2 iterations).
 * They are encoded into the hash string, so `verify` reads them back
 * automatically — they can be raised later without invalidating existing hashes.
 */
const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS)
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password)
  } catch {
    // Malformed hash or other failure — never throw to the caller.
    return false
  }
}

/** SHA-256 hex digest — used to store refresh / verification tokens at rest. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/** High-entropy, URL-safe random token (default 32 bytes → 43 base64url chars). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/** Constant-time string comparison; returns false on length mismatch. */
export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}
