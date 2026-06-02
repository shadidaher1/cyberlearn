import { fail, ok } from '@/lib/api'
import { setAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/schemas/auth'
import { authErrorResponse, clientIp } from '@/server/auth/http'
import { registerUser } from '@/server/auth/register'
import { issueSession } from '@/server/auth/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const limit = await rateLimit(`register:${clientIp(request)}`, 5, 60_000)
  if (!limit.success) return fail(429, 'RATE_LIMITED', 'Too many attempts. Please slow down.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return fail(422, 'VALIDATION', 'Some fields need attention', parsed.error.flatten().fieldErrors)
  }

  try {
    const user = await registerUser(prisma, parsed.data)
    const tokens = await issueSession(prisma, { id: user.id, role: user.role })
    await setAuthCookies(tokens.accessToken, tokens.refreshToken)
    return ok({ user }, { status: 201 })
  } catch (err) {
    return authErrorResponse(err)
  }
}
