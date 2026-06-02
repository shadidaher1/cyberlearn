import { ok } from '@/lib/api'
import { clearAuthCookies, readAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/db'
import { revokeSession } from '@/server/auth/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const { refreshToken } = await readAuthCookies()
  await revokeSession(prisma, refreshToken)
  await clearAuthCookies()
  return ok({ loggedOut: true })
}
