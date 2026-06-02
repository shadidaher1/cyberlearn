import 'server-only'

import { Prisma, type PrismaClient } from '@prisma/client'

const OWASP_PATH_SLUG = 'owasp-top-10'

/**
 * Evaluate and award any newly-earned achievements for a user. Idempotent:
 * award-once is enforced by `UserAchievement(userId, achievementId)` unique, so
 * re-evaluation can never double-grant. Returns the slugs *newly* granted by
 * this call (for the "achievement unlocked" UI).
 */
export async function evaluateAchievements(
  prisma: PrismaClient,
  userId: string,
  context: { firstBlood: boolean },
): Promise<string[]> {
  const score = await prisma.score.findUnique({
    where: { userId },
    select: { points: true, solves: true },
  })

  const candidates = new Set<string>()
  if (score && score.solves >= 1) candidates.add('getting-started')
  if (score && score.points >= 100) candidates.add('centurion')
  if (context.firstBlood) candidates.add('first-blood')

  // OWASP Master — every published challenge in the path solved.
  const path = await prisma.learningPath.findUnique({
    where: { slug: OWASP_PATH_SLUG },
    select: { id: true, _count: { select: { challenges: { where: { published: true } } } } },
  })
  if (path && path._count.challenges > 0) {
    const solvedInPath = await prisma.solve.count({
      where: { userId, challenge: { pathId: path.id, published: true } },
    })
    if (solvedInPath >= path._count.challenges) candidates.add('owasp-master')
  }

  if (candidates.size === 0) return []

  const achievements = await prisma.achievement.findMany({
    where: { slug: { in: [...candidates] } },
    select: { id: true, slug: true },
  })

  const newlyAwarded: string[] = []
  for (const a of achievements) {
    try {
      await prisma.userAchievement.create({ data: { userId, achievementId: a.id } })
      newlyAwarded.push(a.slug)
    } catch (err) {
      // P2002 = the user already has it — not a new award.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) throw err
    }
  }
  return newlyAwarded
}

export interface AchievementStatus {
  slug: string
  name: string
  description: string
  icon: string | null
  earned: boolean
}

export async function listUserAchievements(
  prisma: PrismaClient,
  userId: string | null,
): Promise<AchievementStatus[]> {
  const all = await prisma.achievement.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, name: true, description: true, icon: true },
  })
  const earned = userId
    ? new Set(
        (
          await prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } })
        ).map((u) => u.achievementId),
      )
    : new Set<string>()

  return all.map((a) => ({
    slug: a.slug,
    name: a.name,
    description: a.description,
    icon: a.icon,
    earned: earned.has(a.id),
  }))
}
