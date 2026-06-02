import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { verifyEmailSchema } from '@/schemas/auth'
import { authErrorResponse } from '@/server/auth/http'
import { consumeVerificationToken } from '@/server/auth/verification'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = verifyEmailSchema.safeParse(body)
  if (!parsed.success) return fail(422, 'VALIDATION', 'Invalid or missing token')

  try {
    const userId = await consumeVerificationToken(prisma, parsed.data.token, 'EMAIL_VERIFY')
    if (!userId) return fail(400, 'INVALID_TOKEN', 'This link is invalid or has expired')

    await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } })
    return ok({ verified: true })
  } catch (err) {
    return authErrorResponse(err)
  }
}
