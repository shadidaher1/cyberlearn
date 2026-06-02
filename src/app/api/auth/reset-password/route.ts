import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { hashPassword } from '@/lib/crypto'
import { resetPasswordSchema } from '@/schemas/auth'
import { authErrorResponse, clientIp } from '@/server/auth/http'
import { consumeVerificationToken } from '@/server/auth/verification'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const limit = await rateLimit(`reset:${clientIp(request)}`, 5, 60_000)
  if (!limit.success) return fail(429, 'RATE_LIMITED', 'Too many attempts. Please wait a moment.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return fail(422, 'VALIDATION', 'Check your input', parsed.error.flatten().fieldErrors)
  }

  try {
    const userId = await consumeVerificationToken(prisma, parsed.data.token, 'PASSWORD_RESET')
    if (!userId) return fail(400, 'INVALID_TOKEN', 'This link is invalid or has expired')

    const passwordHash = await hashPassword(parsed.data.password)
    // Set the new password and revoke every existing session (force re-login).
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ])

    return ok({ reset: true })
  } catch (err) {
    return authErrorResponse(err)
  }
}
