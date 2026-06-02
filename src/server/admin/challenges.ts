import 'server-only'

import { Prisma, type PrismaClient } from '@prisma/client'

import { hashFlag } from '@/lib/flag'
import type { AdminChallengeCreate, AdminChallengeUpdate } from '@/schemas/admin'

export type AdminMutationResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; code: 'SLUG_TAKEN' | 'UNKNOWN_CATEGORY' | 'NOT_FOUND'; message: string }

/** Admin challenge list — includes drafts. Never selects `flagHash`. */
export async function adminListChallenges(prisma: PrismaClient) {
  return prisma.challenge.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      owaspRef: true,
      difficulty: true,
      points: true,
      published: true,
      solveCount: true,
      category: { select: { name: true, slug: true } },
    },
  })
}

export async function adminGetChallenge(prisma: PrismaClient, id: string) {
  // Includes everything an editor needs — but NOT the flag (only its hash exists,
  // and even that is not returned). Editing the flag means setting a new one.
  return prisma.challenge.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      owaspRef: true,
      difficulty: true,
      points: true,
      published: true,
      category: { select: { slug: true } },
    },
  })
}

export async function adminCreateChallenge(
  prisma: PrismaClient,
  authorId: string,
  input: AdminChallengeCreate,
): Promise<AdminMutationResult> {
  const category = await prisma.category.findUnique({
    where: { slug: input.categorySlug },
    select: { id: true },
  })
  if (!category) return { ok: false, code: 'UNKNOWN_CATEGORY', message: 'Unknown category' }

  try {
    const challenge = await prisma.challenge.create({
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        owaspRef: input.owaspRef || null,
        categoryId: category.id,
        difficulty: input.difficulty,
        points: input.points,
        flagHash: hashFlag(input.flag),
        authorId,
        published: input.published ?? false,
        releasedAt: input.published ? new Date() : null,
      },
      select: { id: true, slug: true },
    })
    return { ok: true, ...challenge }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { ok: false, code: 'SLUG_TAKEN', message: 'A challenge with that slug already exists' }
    }
    throw err
  }
}

export async function adminUpdateChallenge(
  prisma: PrismaClient,
  id: string,
  input: AdminChallengeUpdate,
): Promise<AdminMutationResult> {
  const existing = await prisma.challenge.findUnique({
    where: { id },
    select: { id: true, published: true },
  })
  if (!existing) return { ok: false, code: 'NOT_FOUND', message: 'Challenge not found' }

  const data: Prisma.ChallengeUpdateInput = {}
  if (input.title !== undefined) data.title = input.title
  if (input.description !== undefined) data.description = input.description
  if (input.owaspRef !== undefined) data.owaspRef = input.owaspRef || null
  if (input.difficulty !== undefined) data.difficulty = input.difficulty
  if (input.points !== undefined) data.points = input.points
  if (input.flag !== undefined) data.flagHash = hashFlag(input.flag) // re-hash; never store plaintext
  if (input.published !== undefined) {
    data.published = input.published
    if (input.published && !existing.published) data.releasedAt = new Date()
  }
  if (input.categorySlug !== undefined) {
    const category = await prisma.category.findUnique({
      where: { slug: input.categorySlug },
      select: { id: true },
    })
    if (!category) return { ok: false, code: 'UNKNOWN_CATEGORY', message: 'Unknown category' }
    data.category = { connect: { id: category.id } }
  }

  const challenge = await prisma.challenge.update({ where: { id }, data, select: { id: true, slug: true } })
  return { ok: true, ...challenge }
}

export async function adminDeleteChallenge(prisma: PrismaClient, id: string): Promise<boolean> {
  try {
    await prisma.challenge.delete({ where: { id } })
    return true
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return false
    throw err
  }
}
