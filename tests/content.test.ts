import { describe, expect, it } from 'vitest'

import { CATEGORIES, COURSES } from '../prisma/content'
import { pathKind } from '../src/config/learning'

const FLAG_RE = /^flag\{[a-z0-9_]+\}$/
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('seed content integrity', () => {
  const allChallenges = COURSES.flatMap((c) => c.challenges)

  it('every course references a known category', () => {
    const cats = new Set(CATEGORIES.map((c) => c.slug))
    for (const course of COURSES) expect(cats.has(course.categorySlug), course.slug).toBe(true)
  })

  it('path slugs are unique and kebab-case', () => {
    const slugs = COURSES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s, s).toMatch(SLUG_RE)
  })

  it('challenge slugs are globally unique and kebab-case', () => {
    const slugs = allChallenges.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const s of slugs) expect(s, s).toMatch(SLUG_RE)
  })

  it('flags are well-formed flag{snake_case}', () => {
    for (const c of allChallenges) expect(c.flag, c.slug).toMatch(FLAG_RE)
  })

  it('each lesson explains how to submit its flag', () => {
    for (const c of allChallenges) expect(c.description, c.slug).toContain('flag{')
  })

  it('points are positive and difficulty is valid', () => {
    for (const c of allChallenges) {
      expect(c.points, c.slug).toBeGreaterThan(0)
      expect(['EASY', 'MEDIUM', 'HARD', 'INSANE'], c.slug).toContain(c.difficulty)
    }
  })

  it('every challenge has at least one usable hint', () => {
    for (const c of allChallenges) {
      expect(c.hints.length, c.slug).toBeGreaterThan(0)
      for (const h of c.hints) {
        expect(h.content.trim().length, c.slug).toBeGreaterThan(0)
        expect(h.cost, c.slug).toBeGreaterThanOrEqual(0)
      }
    }
  })

  // Enforces that any path whose slug ends in -ctf is registered as a CTF in
  // src/config/learning.ts (and that nothing else is misclassified).
  it('CTF paths are classified by config', () => {
    for (const course of COURSES) {
      const expected = course.slug.endsWith('-ctf') ? 'CTF' : 'COURSE'
      expect(pathKind(course.slug), course.slug).toBe(expected)
    }
  })
})
