import { fail, ok } from '@/lib/api'
import { setAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/schemas/auth'
import { clientIp } from '@/server/auth/http'
import { loginUser } from '@/server/auth/login'
import { issueSession } from '@/server/auth/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const limit = await rateLimit(`login:${clientIp(request)}`, 10, 60_000)
  if (!limit.success) return fail(429, 'RATE_LIMITED', 'Too many attempts. Please slow down.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = loginSchema.safeParse(body)
  // Generic on purpose — never reveal whether it was the email or the password.
  if (!parsed.success) return fail(401, 'INVALID_CREDENTIALS', 'Incorrect email or password')

  const user = await loginUser(prisma, parsed.data)
  if (!user) return fail(401, 'INVALID_CREDENTIALS', 'Incorrect email or password')

  const tokens = await issueSession(prisma, { id: user.id, role: user.role })
  await setAuthCookies(tokens.accessToken, tokens.refreshToken)
  return ok({ user })
}
