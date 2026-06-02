import 'server-only'

import { fail } from '@/lib/api'
import { getSession, type SessionUser } from '@/server/auth/session'

/**
 * Route-handler admin guard. Returns the admin user, or a ready-to-return
 * 401/403 response. Authorization is always enforced here, server-side —
 * never assumed from the UI.
 */
export async function requireAdminOrResponse(): Promise<
  { user: SessionUser } | { response: Response }
> {
  const user = await getSession()
  if (!user) return { response: fail(401, 'UNAUTHORIZED', 'Authentication required') }
  if (user.role !== 'ADMIN') return { response: fail(403, 'FORBIDDEN', 'Admin access required') }
  return { user }
}
