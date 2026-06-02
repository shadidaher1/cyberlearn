import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { adminChallengeUpdateSchema } from '@/schemas/admin'
import { adminDeleteChallenge, adminUpdateChallenge } from '@/server/admin/challenges'
import { requireAdminOrResponse } from '@/server/admin/guard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrResponse()
  if ('response' in auth) return auth.response

  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'BAD_REQUEST', 'Invalid request body')
  }

  const parsed = adminChallengeUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return fail(422, 'VALIDATION', 'Check your input', parsed.error.flatten().fieldErrors)
  }

  const result = await adminUpdateChallenge(prisma, id, parsed.data)
  if (!result.ok) {
    const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'SLUG_TAKEN' ? 409 : 422
    return fail(status, result.code, result.message)
  }
  return ok({ id: result.id, slug: result.slug })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrResponse()
  if ('response' in auth) return auth.response

  const { id } = await params
  const deleted = await adminDeleteChallenge(prisma, id)
  if (!deleted) return fail(404, 'NOT_FOUND', 'Challenge not found')
  return ok({ deleted: true })
}
