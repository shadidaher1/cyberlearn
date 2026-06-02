import { fail, ok } from '@/lib/api'
import { clearAuthCookies, readAuthCookies, setAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/db'
import { authErrorResponse } from '@/server/auth/http'
import { rotateSession } from '@/server/auth/tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const { refreshToken } = await readAuthCookies()
  if (!refreshToken) return fail(401, 'UNAUTHORIZED', 'No active session')

  try {
    const tokens = await rotateSession(prisma, refreshToken)
    if (!tokens) {
      await clearAuthCookies()
      return fail(401, 'UNAUTHORIZED', 'Session expired, please sign in again')
    }
    await setAuthCookies(tokens.accessToken, tokens.refreshToken)
    return ok({ refreshed: true })
  } catch (err) {
    return authErrorResponse(err)
  }
}
