import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import { DifficultyBadge } from '@/components/challenges/difficulty-badge'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { getLearningPathBySlug } from '@/server/challenges/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>
}): Promise<Metadata> {
  const { path } = await params
  const found = await getLearningPathBySlug(prisma, path, null)
  return { title: found?.title ?? 'Learning path' }
}

export default async function LearningPathPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params
  const user = await getSession()
  const found = await getLearningPathBySlug(prisma, path, user?.id ?? null)
  if (!found) notFound()

  const solved = found.challenges.filter((c) => c.solved).length
  const isCtf = found.kind === 'CTF'

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-4xl">
        <Link href="/learn" className="font-mono text-xs text-muted-foreground hover:text-accent">
          ← all paths
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <BracketLabel>{found.category.name}</BracketLabel>
          {isCtf && (
            <span className="font-mono text-[11px] tracking-wider text-accent uppercase">
              capture the flag
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{found.title}</h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">{found.summary}</p>
        <div className="mt-4 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <DifficultyBadge difficulty={found.difficulty} />
          <span aria-hidden>·</span>
          <span>
            <span className="text-accent">{solved}</span> / {found.challenges.length} captured
          </span>
        </div>

        {found.challenges.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">
            No challenges published yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {found.challenges.map((c) => (
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
