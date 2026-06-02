import { fail, ok } from '@/lib/api'
import { getSession } from '@/server/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getSession()
    return ok({ user: user ?? null })
  } catch (err) {
    console.error('[auth] session lookup failed:', err)
    return fail(503, 'UNAVAILABLE', 'Could not load session')
  }
}
