import type { Metadata } from 'next'
import Link from 'next/link'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { prisma } from '@/lib/db'
import { cn } from '@/lib/utils'
import { getSession } from '@/server/auth/session'
import { getLeaderboard } from '@/server/leaderboard'

export const metadata: Metadata = { title: 'Leaderboard' }
export const dynamic = 'force-dynamic'

export default async function LeaderboardPage() {
  const user = await getSession()
  const rows = await getLeaderboard(prisma, 50)

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <BracketLabel>leaderboard</BracketLabel>
          <Link href="/learn" className="font-mono text-xs text-muted-foreground hover:text-accent">
            challenges →
          </Link>
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">Top operators</h1>
        <p className="mt-2 text-muted-foreground">
          Ranked by points; ties broken by who reached the score first.
        </p>

        {rows.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">
            No one has captured a flag yet — be the first.
          </p>
        ) : (
          <ol className="mt-8 divide-y divide-border overflow-hidden rounded-lg border border-border">
            {rows.map((r) => {
              const isMe = user?.username === r.username
              return (
                <li
                  key={r.username}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3',
                    isMe ? 'bg-accent-muted' : 'bg-surface',
                  )}
                >
                  <span
                    className={cn(
                      'w-8 shrink-0 text-center font-mono text-sm',
                      r.rank <= 3 ? 'text-accent' : 'text-muted-foreground',
                    )}
                  >
                    #{r.rank}
                  </span>
                  <span className="flex-1 truncate font-medium">
                    {r.username}
                    {isMe && <span className="ml-2 font-mono text-xs text-accent">you</span>}
                  </span>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                    {r.solves} solved
                  </span>
                  <span className="font-mono text-sm text-accent">{r.points} pts</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </main>
  )
}
