import { ok } from '@/lib/api'
import { prisma } from '@/lib/db'
import { listCategories } from '@/server/challenges/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const categories = await listCategories(prisma)
  return ok({ categories })
}
