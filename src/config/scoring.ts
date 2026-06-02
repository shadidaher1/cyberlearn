import type { Difficulty } from '@prisma/client'

/** Base points by difficulty (an admin may override per challenge). */
export const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  EASY: 50,
  MEDIUM: 100,
  HARD: 250,
  INSANE: 500,
}

/** First solver of a challenge earns a bonus on top of the base award. */
export const FIRST_BLOOD_BONUS_PCT = 0.25

export interface Rank {
  name: string
  min: number
}

/** Named ranks by cumulative points. See docs/GAMIFICATION.md. */
export const RANKS: readonly Rank[] = [
  { name: 'Script Kiddie', min: 0 },
  { name: 'Initiate', min: 250 },
  { name: 'Operator', min: 750 },
  { name: 'Breaker', min: 1_750 },
  { name: 'Specialist', min: 3_500 },
  { name: 'Elite', min: 7_000 },
  { name: 'Phantom', min: 12_000 },
]

export interface RankProgress {
  rank: string
  nextRank: string | null
  pointsIntoRank: number
  pointsToNext: number | null
  /** 0–1 progress toward the next rank (1 when at the top rank). */
  progress: number
}

export function rankForPoints(points: number): RankProgress {
  let index = 0
  for (let i = 0; i < RANKS.length; i += 1) {
    if (points >= RANKS[i]!.min) index = i
  }
  const current = RANKS[index]!
  const next = RANKS[index + 1] ?? null

  if (!next) {
    return {
      rank: current.name,
      nextRank: null,
      pointsIntoRank: points - current.min,
      pointsToNext: null,
      progress: 1,
    }
  }

  const span = next.min - current.min
  const into = points - current.min
  return {
    rank: current.name,
    nextRank: next.name,
    pointsIntoRank: into,
    pointsToNext: next.min - points,
    progress: Math.min(1, into / span),
  }
}
