import { fail, ok } from '@/lib/api'
import { env } from '@/lib/env'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { emailRequestSchema } from '@/schemas/auth'
import { clientIp } from '@/server/auth/http'
import { createVerificationToken } from '@/server/auth/verification'
import { sendVerificationEmail } from '@/server/email/mailer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const limit = await rateLimit(`resend-verify:${clientIp(request)}`, 3, 60_000)
  if (!limit.success) return fail(429, 'RATE_LIMITED', 'Too many requests. Please wait a moment.')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = emailRequestSchema.safeParse(body)
  if (!parsed.success) return fail(422, 'VALIDATION', 'Enter a valid email')

  // Always respond generically — never reveal whether the account exists.
  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, emailVerified: true },
    })
    if (user && !user.emailVerified) {
      const token = await createVerificationToken(prisma, user.id, 'EMAIL_VERIFY')
      await sendVerificationEmail(user.email, `${env.APP_URL}/verify-email?token=${token}`)
    }
  } catch (err) {
    console.error('[auth] resend-verification failed:', err)
  }

  return ok({ sent: true })
}
