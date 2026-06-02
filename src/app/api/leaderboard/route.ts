import { ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { getLeaderboard } from '@/server/leaderboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const leaderboard = await getLeaderboard(prisma, 50)
  return ok({ leaderboard })
}
