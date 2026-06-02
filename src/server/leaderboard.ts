import 'server-only'

import type { PrismaClient } from '@prisma/client'

export interface LeaderboardRow {
  rank: number
  username: string
  avatarUrl: string | null
  points: number
  solves: number
}

/**
 * Leaderboard, ordered deterministically:
 *   points DESC, then lastSolveAt ASC (earlier reacher wins ties),
 *   then userId ASC (stable final tie-break so paging never reshuffles).
 * Admins/authors are excluded from ranking.
 */
export async function getLeaderboard(prisma: PrismaClient, limit = 50): Promise<LeaderboardRow[]> {
  const rows = await prisma.score.findMany({
    where: { points: { gt: 0 }, user: { role: 'USER' } },
    orderBy: [{ points: 'desc' }, { lastSolveAt: 'asc' }, { userId: 'asc' }],
    take: limit,
    select: {
      points: true,
      solves: true,
      user: { select: { username: true, avatarUrl: true } },
    },
  })

  return rows.map((r, i) => ({
    rank: i + 1,
    username: r.user.username,
    avatarUrl: r.user.avatarUrl,
    points: r.points,
    solves: r.solves,
  }))
}

export interface UserStats {
  points: number
  solves: number
  /** Leaderboard position (1-based), or null if the user has no points. */
  rank: number | null
}

export async function getUserStats(prisma: PrismaClient, userId: string): Promise<UserStats> {
  const score = await prisma.score.findUnique({
    where: { userId },
    select: { points: true, solves: true, lastSolveAt: true },
  })
  if (!score || score.points <= 0) {
    return { points: score?.points ?? 0, solves: score?.solves ?? 0, rank: null }
  }

  // Rank = (users strictly ahead by points) + (tied on points but reached it earlier) + 1.
  const ahead = await prisma.score.count({
    where: {
      user: { role: 'USER' },
      OR: [
        { points: { gt: score.points } },
        { points: score.points, lastSolveAt: { lt: score.lastSolveAt ?? new Date(0) } },
      ],
    },
  })

  return { points: score.points, solves: score.solves, rank: ahead + 1 }
}
