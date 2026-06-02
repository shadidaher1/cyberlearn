import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { hashFlag } from '@/lib/flag'
import { submitFlag } from '@/server/challenges/submit'

/**
 * Solve-once + concurrency, against a real Postgres. Gated on
 * `INTEGRATION_DATABASE_URL` (point it at a Neon `test` branch — never prod) so
 * it does not run in the default `npm test` / CI. All data uses a unique suffix
 * and is removed in afterAll.
 *
 * Use a generous timeout — interactive transactions over a remote DB are slow:
 *
 *   INTEGRATION_DATABASE_URL="postgresql://…" \
 *     npx vitest run tests/integration --testTimeout=40000 --hookTimeout=40000
 */
const DB_URL = process.env.INTEGRATION_DATABASE_URL
const suite = DB_URL ? describe : describe.skip

suite('solve-once & concurrency', () => {
  const prisma = new PrismaClient(DB_URL ? { datasources: { db: { url: DB_URL } } } : undefined)
  const tag = `_it_${Date.now()}`
  const slug = `chal${tag}`
  const FLAG = 'flag{integration_test}'

  let categoryId = ''
  let challengeId = ''
  const userIds: string[] = []

  beforeAll(async () => {
    const category = await prisma.category.create({
      data: { slug: `cat${tag}`, name: 'IT', description: 'integration' },
    })
    categoryId = category.id

    const challenge = await prisma.challenge.create({
      data: {
        slug,
        title: 'Integration Challenge',
        description: 'x',
        categoryId,
        difficulty: 'EASY',
        points: 50,
        flagHash: hashFlag(FLAG),
        published: true,
      },
    })
    challengeId = challenge.id

    for (let i = 0; i < 2; i += 1) {
      const u = await prisma.user.create({
        data: { email: `it${i}${tag}@test.local`, username: `it${i}${tag}` },
      })
      userIds.push(u.id)
    }
  })

  afterAll(async () => {
    await prisma.submission.deleteMany({ where: { challengeId } })
    await prisma.solve.deleteMany({ where: { challengeId } })
    await prisma.score.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.challenge.deleteMany({ where: { id: challengeId } })
    await prisma.category.deleteMany({ where: { id: categoryId } })
    await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    await prisma.$disconnect()
  })

  it('rejects a wrong flag without awarding anything', async () => {
    const result = await submitFlag(prisma, userIds[0]!, slug, 'flag{nope}')
    expect(result.status).toBe('WRONG')
    expect(await prisma.solve.count({ where: { challengeId } })).toBe(0)
  })

  it('awards points exactly once under two concurrent correct submissions', async () => {
    const [a, b] = await Promise.all([
      submitFlag(prisma, userIds[0]!, slug, FLAG),
      submitFlag(prisma, userIds[0]!, slug, FLAG),
    ])

    // Exactly one wins the solve; the other sees it as already solved.
    expect([a.status, b.status].sort()).toEqual(['ALREADY_SOLVED', 'CORRECT'])

    expect(await prisma.solve.count({ where: { userId: userIds[0], challengeId } })).toBe(1)

    const score = await prisma.score.findUnique({ where: { userId: userIds[0] } })
    expect(score?.solves).toBe(1)
    // First solver: 50 base + round(50 * 0.25) first-blood bonus = 63.
    expect(score?.points).toBe(63)
  })

  it('a second, different user is not awarded first blood', async () => {
    const result = await submitFlag(prisma, userIds[1]!, slug, FLAG)
    expect(result.status).toBe('CORRECT')
    if (result.status === 'CORRECT') {
      expect(result.firstBlood).toBe(false)
      expect(result.awardedPoints).toBe(50)
    }
  })
})
