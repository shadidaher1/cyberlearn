import 'server-only'

import type { PrismaClient } from '@prisma/client'

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
        (
          await prisma.solve.findMany({ where: { userId }, select: { challengeId: true } })
        ).map((s) => s.challengeId),
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
