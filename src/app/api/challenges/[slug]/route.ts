import { fail, ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { getChallenge } from '@/server/challenges/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSession()
  const challenge = await getChallenge(prisma, slug, user?.id ?? null)
  if (!challenge) return fail(404, 'NOT_FOUND', 'Challenge not found')
  return ok({ challenge })
}
