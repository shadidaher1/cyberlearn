import 'server-only'

import { Prisma, type PrismaClient } from '@prisma/client'

import { FIRST_BLOOD_BONUS_PCT, POINTS_BY_DIFFICULTY } from '@/config/scoring'
import { verifyFlag } from '@/lib/flag'

export type SubmitResult =
  | { status: 'NOT_FOUND' }
  | { status: 'WRONG' }
  | { status: 'ALREADY_SOLVED' }
  | { status: 'CORRECT'; awardedPoints: number; firstBlood: boolean }

/**
 * Record a flag submission. The flag is compared in constant time against the
 * stored HMAC; on a correct, first-time solve, the solve + score are written in
 * a single transaction. Solve-once is guaranteed by the `Solve(userId,
 * challengeId)` unique constraint — a concurrent or repeated correct submission
 * hits the constraint and awards nothing twice. The flag is never returned.
 */
export async function submitFlag(
  prisma: PrismaClient,
  userId: string,
  challengeSlug: string,
  rawFlag: string,
): Promise<SubmitResult> {
  const challenge = await prisma.challenge.findUnique({
    where: { slug: challengeSlug },
    select: {
      id: true,
      flagHash: true,
      points: true,
      difficulty: true,
      published: true,
      authorId: true,
    },
  })
  if (!challenge || !challenge.published) return { status: 'NOT_FOUND' }

  const correct = verifyFlag(rawFlag, challenge.flagHash)

  // Always log the outcome — never the raw attempt (it could be a near-flag).
  await prisma.submission.create({
    data: { userId, challengeId: challenge.id, correct },
  })

  if (!correct) return { status: 'WRONG' }

  // Authors never score their own challenges (no self-dealing).
  const isAuthor = challenge.authorId === userId

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Atomic first-blood: the transaction that bumps solveCount to 1 owns it.
      // (The increment row-locks the challenge, serialising concurrent solvers.)
      const updated = await tx.challenge.update({
        where: { id: challenge.id },
        data: { solveCount: { increment: 1 } },
        select: { solveCount: true },
      })
      const firstBlood = updated.solveCount === 1 && !isAuthor

      const base = challenge.points || POINTS_BY_DIFFICULTY[challenge.difficulty]
      const awarded = isAuthor
        ? 0
        : base + (firstBlood ? Math.round(base * FIRST_BLOOD_BONUS_PCT) : 0)

      // Solve insert — unique(userId, challengeId) enforces solve-once. A repeat
      // or concurrent solve by the same user throws P2002 and rolls everything
      // back (including the solveCount bump above).
      await tx.solve.create({
        data: { userId, challengeId: challenge.id, points: awarded, isFirstBlood: firstBlood },
      })

      if (awarded > 0) {
        await tx.score.upsert({
          where: { userId },
          create: { userId, points: awarded, solves: 1, lastSolveAt: new Date() },
          update: { points: { increment: awarded }, solves: { increment: 1 }, lastSolveAt: new Date() },
        })
      }

      return { awarded, firstBlood }
    })

    return { status: 'CORRECT', awardedPoints: result.awarded, firstBlood: result.firstBlood }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return { status: 'ALREADY_SOLVED' }
    }
    throw err
  }
}
