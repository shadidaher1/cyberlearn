import 'server-only'

import type { Difficulty, PrismaClient } from '@prisma/client'

import { pathKind, type PathKind } from '@/config/learning'

// NOTE: none of these selects include `flagHash` — the flag hash never leaves
// the data layer. Listing/detail responses are flag-free by construction.

export async function listCategories(prisma: PrismaClient) {
  return prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      icon: true,
      _count: { select: { challenges: { where: { published: true } } } },
    },
  })
}

export async function listChallenges(prisma: PrismaClient, userId: string | null) {
  const challenges = await prisma.challenge.findMany({
    where: { published: true },
    orderBy: [{ orderInPath: 'asc' }, { points: 'asc' }, { title: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      owaspRef: true,
      difficulty: true,
      points: true,
      solveCount: true,
      category: { select: { slug: true, name: true } },
    },
  })

  const solvedIds = userId
    ? new Set(
        (await prisma.solve.findMany({ where: { userId }, select: { challengeId: true } })).map(
          (s) => s.challengeId,
        ),
      )
    : new Set<string>()

  return challenges.map((c) => ({ ...c, solved: solvedIds.has(c.id) }))
}

export async function getChallenge(prisma: PrismaClient, slug: string, userId: string | null) {
  const challenge = await prisma.challenge.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      owaspRef: true,
      difficulty: true,
      points: true,
      solveCount: true,
      category: { select: { slug: true, name: true } },
      path: { select: { slug: true, title: true } },
      hints: {
        orderBy: { order: 'asc' },
        select: { id: true, order: true, content: true, cost: true },
      },
    },
  })
  if (!challenge) return null

  const solved = userId
    ? (await prisma.solve.findUnique({
        where: { userId_challengeId: { userId, challengeId: challenge.id } },
        select: { id: true },
      })) !== null
    : false

  return { ...challenge, solved }
}

export interface CatalogPath {
  slug: string
  title: string
  summary: string
  difficulty: Difficulty
  kind: PathKind
  lessonCount: number
  solvedCount: number
}

export interface CatalogCategory {
  slug: string
  name: string
  description: string
  icon: string | null
  courses: CatalogPath[]
  ctf: CatalogPath[]
}

/**
 * The learning catalog: every category with at least one published path, each
 * path annotated with its kind (COURSE/CTF) and the user's progress. Flag-free.
 */
export async function listCatalog(
  prisma: PrismaClient,
  userId: string | null,
): Promise<CatalogCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: {
      slug: true,
      name: true,
      description: true,
      icon: true,
      paths: {
        where: { published: true },
        orderBy: { order: 'asc' },
        select: {
          slug: true,
          title: true,
          summary: true,
          difficulty: true,
          challenges: { where: { published: true }, select: { id: true } },
        },
      },
    },
  })

  const solvedIds = userId
    ? new Set(
        (await prisma.solve.findMany({ where: { userId }, select: { challengeId: true } })).map(
          (s) => s.challengeId,
        ),
      )
    : new Set<string>()

  const result: CatalogCategory[] = []
  for (const cat of categories) {
    if (cat.paths.length === 0) continue
    const paths: CatalogPath[] = cat.paths.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      difficulty: p.difficulty,
      kind: pathKind(p.slug),
      lessonCount: p.challenges.length,
      solvedCount: p.challenges.filter((c) => solvedIds.has(c.id)).length,
    }))
    result.push({
      slug: cat.slug,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      courses: paths.filter((p) => p.kind === 'COURSE'),
      ctf: paths.filter((p) => p.kind === 'CTF'),
    })
  }
  return result
}

/** A single learning path with its ordered, published challenges. Flag-free. */
export async function getLearningPathBySlug(
  prisma: PrismaClient,
  slug: string,
  userId: string | null,
) {
  const path = await prisma.learningPath.findFirst({
    where: { slug, published: true },
    select: {
      slug: true,
      title: true,
      summary: true,
      difficulty: true,
      category: { select: { slug: true, name: true } },
      challenges: {
        where: { published: true },
        orderBy: [{ orderInPath: 'asc' }, { points: 'asc' }, { title: 'asc' }],
        select: {
          id: true,
          slug: true,
          title: true,
          owaspRef: true,
          difficulty: true,
          points: true,
          solveCount: true,
        },
      },
    },
  })
  if (!path) return null

  const solvedIds = userId
    ? new Set(
        (await prisma.solve.findMany({ where: { userId }, select: { challengeId: true } })).map(
          (s) => s.challengeId,
        ),
      )
    : new Set<string>()

  return {
    slug: path.slug,
    title: path.title,
    summary: path.summary,
    difficulty: path.difficulty,
    category: path.category,
    kind: pathKind(path.slug),
    challenges: path.challenges.map((c) => ({ ...c, solved: solvedIds.has(c.id) })),
  }
}
