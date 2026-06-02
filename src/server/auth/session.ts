import 'server-only'

import { readAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/db'
import { verifyAccessToken } from '@/lib/jwt'

import { AuthError } from './errors'

export interface SessionUser {
  id: string
  email: string
  username: string
  role: 'USER' | 'ADMIN'
}

/** Resolve the current user from the access-token cookie, or `null`. */
export async function getSession(): Promise<SessionUser | null> {
  const { accessToken } = await readAuthCookies()
  if (!accessToken) return null

  const claims = await verifyAccessToken(accessToken)
  if (!claims) return null

  // The token is signed by us, but confirm the user still exists / load fresh role.
  return prisma.user.findUnique({
    where: { id: claims.sub },
    select: { id: true, email: true, username: true, role: true },
  })
}

/** Require an authenticated user. Throws `AuthError('UNAUTHORIZED')` otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession()
  if (!user) throw new AuthError('UNAUTHORIZED', 'Authentication required')
  return user
}

/** Require an admin. Throws `UNAUTHORIZED` or `FORBIDDEN`. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'ADMIN') throw new AuthError('FORBIDDEN', 'Admin access required')
  return user
}
