import type { Difficulty } from '@prisma/client'

/**
 * Authoring types for seed content. These mirror the relevant Prisma fields but
 * stay decoupled from the client so content modules can be imported (and unit
 * tested) without a database connection.
 */

/** A single capturable lesson or CTF challenge. */
export interface SeedChallenge {
  slug: string
  title: string
  /** OWASP label, e.g. "A01:2021 — Broken Access Control". Omitted for non-OWASP content. */
  owaspRef?: string
  difficulty: Difficulty
  points: number
  /** Markdown lesson body. Must explain how to submit the flag. */
  description: string
  /** Plaintext flag — HMAC-hashed at seed time, never stored or returned in plaintext. */
  flag: string
  hints: { content: string; cost: number }[]
}

export interface SeedCategory {
  slug: string
  name: string
  description: string
  icon: string
  order: number
}

/**
 * A learning path plus its ordered challenges. COURSE vs CTF is not stored here
 * — it is derived from the slug in `src/config/learning.ts`.
 */
export interface SeedCourse {
  /** Slug of the owning category (must exist in CATEGORIES). */
  categorySlug: string
  slug: string
  title: string
  summary: string
  difficulty: Difficulty
  order: number
  challenges: SeedChallenge[]
}
