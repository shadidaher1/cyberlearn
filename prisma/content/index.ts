import { CATEGORIES } from './categories'
import type { SeedCourse } from './types'

export { CATEGORIES }
export type { SeedCategory, SeedChallenge, SeedCourse } from './types'

/**
 * Course registry consumed by `prisma/seed.ts`. Each course is appended on its
 * own feature branch — feat/linux-basics, feat/linux-advanced, feat/linux-ctf,
 * feat/osint, feat/osint-ctf. The OWASP Top 10 stays inline in the seed (it is
 * already live) and is intentionally not duplicated here.
 */
export const COURSES: SeedCourse[] = []
