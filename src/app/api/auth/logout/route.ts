import { ok } from '@/lib/api'
import { clearAuthCookies, readAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/db'
import { revokeSession } from '@/server/auth/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const { refreshToken } = await readAuthCookies()
  try {
    await revokeSession(prisma, refreshToken)
  } catch (err) {
    // Best-effort revoke; we always clear the client's cookies regardless.
    console.error('[auth] logout revoke failed:', err)
  }
  await clearAuthCookies()
  return ok({ loggedOut: true })
}
