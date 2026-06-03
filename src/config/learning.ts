/**
 * Course vs. CTF classification for learning paths.
 *
 * This lives in versioned config rather than a `LearningPath.kind` column on
 * purpose: the local `.env` points at the shared production database, so we
 * avoid a schema migration for what is, today, a purely presentational split.
 * Paths are taught COURSES by default; the slugs listed here are applied
 * capture-the-flag tracks, surfaced as a secondary section in the catalog.
 * Promote this to a DB column if/when path management moves into the admin UI.
 */
export type PathKind = 'COURSE' | 'CTF'

const CTF_PATH_SLUGS: ReadonlySet<string> = new Set<string>(['linux-ctf', 'osint-ctf'])

export function pathKind(slug: string): PathKind {
  return CTF_PATH_SLUGS.has(slug) ? 'CTF' : 'COURSE'
}
