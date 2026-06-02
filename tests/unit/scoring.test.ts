import { describe, expect, it } from 'vitest'

import { POINTS_BY_DIFFICULTY, rankForPoints } from '@/config/scoring'

describe('rankForPoints', () => {
  it('starts at Script Kiddie with 0 points', () => {
    const r = rankForPoints(0)
    expect(r.rank).toBe('Script Kiddie')
    expect(r.nextRank).toBe('Initiate')
  })

  it('promotes exactly at thresholds', () => {
    expect(rankForPoints(249).rank).toBe('Script Kiddie')
    expect(rankForPoints(250).rank).toBe('Initiate')
    expect(rankForPoints(749).rank).toBe('Initiate')
    expect(rankForPoints(750).rank).toBe('Operator')
  })

  it('caps at the top rank with full progress', () => {
    const r = rankForPoints(99_999)
    expect(r.rank).toBe('Phantom')
    expect(r.nextRank).toBeNull()
    expect(r.pointsToNext).toBeNull()
    expect(r.progress).toBe(1)
  })

  it('computes progress toward the next rank', () => {
    const r = rankForPoints(500) // halfway between Initiate (250) and Operator (750)
    expect(r.pointsToNext).toBe(250)
    expect(r.progress).toBeCloseTo(0.5)
  })
})

describe('POINTS_BY_DIFFICULTY', () => {
  it('scales with difficulty', () => {
    expect(POINTS_BY_DIFFICULTY.EASY).toBeLessThan(POINTS_BY_DIFFICULTY.MEDIUM)
    expect(POINTS_BY_DIFFICULTY.MEDIUM).toBeLessThan(POINTS_BY_DIFFICULTY.HARD)
    expect(POINTS_BY_DIFFICULTY.HARD).toBeLessThan(POINTS_BY_DIFFICULTY.INSANE)
  })
})
