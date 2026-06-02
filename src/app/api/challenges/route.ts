import { ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { listChallenges } from '@/server/challenges/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  const challenges = await listChallenges(prisma, user?.id ?? null)
  return ok({ challenges })
}
