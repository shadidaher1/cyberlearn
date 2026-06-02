import type { Metadata } from 'next'
import Link from 'next/link'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { listChallenges } from '@/server/challenges/queries'

export const metadata: Metadata = { title: 'Learn — OWASP Top 10' }
export const dynamic = 'force-dynamic'

export default async function LearnPage() {
  const user = await getSession()
  const challenges = await listChallenges(prisma, user?.id ?? null)
  const solvedCount = challenges.filter((c) => c.solved).length

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <BracketLabel>learning path</BracketLabel>
          <Link href="/dashboard" className="font-mono text-xs text-muted-foreground hover:text-accent">
            dashboard →
          </Link>
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">OWASP Top 10</h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          The ten most critical web application security risks. Read each lesson, then capture its
          flag to prove you understood it.
        </p>
        <p className="mt-4 font-mono text-sm text-muted-foreground">
          <span className="text-accent">{solvedCount}</span> / {challenges.length} captured
        </p>

        {challenges.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">
            No challenges published yet. Run the seed to load the OWASP Top 10.
          </p>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {challenges.map((c) => (
              <ChallengeCard
                key={c.slug}
                slug={c.slug}
                title={c.title}
                owaspRef={c.owaspRef}
                difficulty={c.difficulty}
                points={c.points}
                solveCount={c.solveCount}
                solved={c.solved}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
