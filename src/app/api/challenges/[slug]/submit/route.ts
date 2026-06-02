import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { submitFlagSchema } from '@/schemas/challenge'
import { getSession } from '@/server/auth/session'
import { submitFlag } from '@/server/challenges/submit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const user = await getSession()
  if (!user) return fail(401, 'UNAUTHORIZED', 'Sign in to submit flags')

  // Per-user, per-challenge rate limit blunts flag brute-forcing.
  const limit = await rateLimit(`submit:${user.id}:${slug}`, 12, 60_000)
  if (!limit.success) return fail(429, 'RATE_LIMITED', 'Too many attempts. Slow down a moment.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = submitFlagSchema.safeParse(body)
  if (!parsed.success) return fail(422, 'VALIDATION', 'Enter a flag')

  try {
    const result = await submitFlag(prisma, user.id, slug, parsed.data.flag)
    if (result.status === 'NOT_FOUND') return fail(404, 'NOT_FOUND', 'Challenge not found')
    if (result.status === 'WRONG') return ok({ correct: false })
    if (result.status === 'ALREADY_SOLVED') return ok({ correct: true, alreadySolved: true })
    // CORRECT
    return ok({
      correct: true,
      awardedPoints: result.awardedPoints,
      firstBlood: result.firstBlood,
    })
  } catch (err) {
    console.error('[submit] error:', err)
    return fail(500, 'INTERNAL', 'Something went wrong')
  }
}
