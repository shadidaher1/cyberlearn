import { fail, ok } from '@/lib/api'
import { env } from '@/lib/env'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { emailRequestSchema } from '@/schemas/auth'
import { clientIp } from '@/server/auth/http'
import { createVerificationToken } from '@/server/auth/verification'
import { sendPasswordResetEmail } from '@/server/email/mailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const limit = await rateLimit(`forgot:${clientIp(request)}`, 3, 60_000)
  if (!limit.success) return fail(429, 'RATE_LIMITED', 'Too many requests. Please wait a moment.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = emailRequestSchema.safeParse(body)
  if (!parsed.success) return fail(422, 'VALIDATION', 'Enter a valid email')

  // Always respond generically — a reset request never reveals if the email exists.
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true },
    })
    if (user) {
      const token = await createVerificationToken(prisma, user.id, 'PASSWORD_RESET')
      await sendPasswordResetEmail(user.email, `${env.APP_URL}/reset-password?token=${token}`)
    }
  } catch (err) {
    console.error('[auth] forgot-password failed:', err)
  }

  return ok({ sent: true })
}
