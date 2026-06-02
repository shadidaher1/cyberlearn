import { ok } from '@/lib/api'
import { getSession } from '@/server/auth/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSession()
  return ok({ user: user ?? null })
}
