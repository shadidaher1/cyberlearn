import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { adminChallengeCreateSchema } from '@/schemas/admin'
import { adminCreateChallenge, adminListChallenges } from '@/server/admin/challenges'
import { requireAdminOrResponse } from '@/server/admin/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdminOrResponse()
  if ('response' in auth) return auth.response
  const challenges = await adminListChallenges(prisma)
  return ok({ challenges })
}

export async function POST(request: Request) {
  const auth = await requireAdminOrResponse()
  if ('response' in auth) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = adminChallengeCreateSchema.safeParse(body)
  if (!parsed.success) {
    return fail(422, 'VALIDATION', 'Check your input', parsed.error.flatten().fieldErrors)
  }

  const result = await adminCreateChallenge(prisma, auth.user.id, parsed.data)
  if (!result.ok) {
    return fail(result.code === 'SLUG_TAKEN' ? 409 : 422, result.code, result.message)
  }
  return ok({ id: result.id, slug: result.slug }, { status: 201 })
}
