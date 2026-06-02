import { NextResponse } from 'next/server'

import { prisma } from '@/lib/db'

// Prisma needs the Node.js runtime (not edge); never cache the health result.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/health — liveness + database reachability.
 * Returns 200 when healthy, 503 when the database is unreachable. Never leaks
 * connection strings or error internals.
 */
export async function GET() {
  const startedAt = Date.now()
  let database: 'up' | 'down' = 'up'

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    database = 'down'
  }

  const body = {
    ok: database === 'up',
    service: 'cyberlearn',
    status: database === 'up' ? 'healthy' : 'degraded',
    database,
    latencyMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(body, { status: database === 'up' ? 200 : 503 })
}
