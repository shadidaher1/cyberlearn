import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/auth/logout-button'
import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { AchievementGrid } from '@/components/gamification/achievement-grid'
import { RankProgress } from '@/components/gamification/rank-progress'
import { StatTile } from '@/components/gamification/stat-tile'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { listUserAchievements } from '@/server/challenges/achievements'
import { listChallenges } from '@/server/challenges/queries'
import { getUserStats } from '@/server/leaderboard'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  const [stats, achievements, challenges] = await Promise.all([
    getUserStats(prisma, user.id),
    listUserAchievements(prisma, user.id),
    listChallenges(prisma, user.id),
  ])
  const solved = challenges.filter((c) => c.solved).length
  const total = challenges.length
  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <BracketLabel>dashboard</BracketLabel>
          <div className="flex items-center gap-4">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="font-mono text-xs text-accent hover:underline"
              >
                admin →
              </Link>
            )}
            <Link
              href="/leaderboard"
              className="font-mono text-xs text-muted-foreground hover:text-accent"
            >
              leaderboard →
            </Link>
            <LogoutButton />
          </div>
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">
          Welcome, <span className="text-accent text-accent-glow">{user.username}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your training ground. Capture flags, climb the ranks.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatTile label="points" value={stats.points} accent />
          <StatTile label="rank" value={stats.rank ? `#${stats.rank}` : '—'} />
          <StatTile label="solved" value={`${solved} / ${total}`} />
        </div>

        <div className="mt-3">
          <RankProgress points={stats.points} />
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 rounded-lg border border-border bg-surface p-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              owasp top 10
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {solved} of {total} captured
            </p>
          </div>
          <Button asChild>
            <Link href="/learn">
              {solved === 0 ? 'Start' : solved >= total ? 'Review' : 'Continue'}
            </Link>
          </Button>
        </div>

        <section className="mt-10">
          <BracketLabel className="mb-4">
            achievements [ {earnedCount}/{achievements.length} ]
          </BracketLabel>
          <AchievementGrid achievements={achievements} />
        </section>
      </div>
    </main>
  )
}
