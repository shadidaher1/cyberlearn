import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { DifficultyBadge } from '@/components/challenges/difficulty-badge'
import { Lesson } from '@/components/challenges/lesson'
import { SubmitFlag } from '@/components/challenges/submit-flag'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { getChallenge } from '@/server/challenges/queries'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const challenge = await getChallenge(prisma, slug, null)
  return { title: challenge?.title ?? 'Challenge' }
}

export default async function ChallengePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSession()
  const challenge = await getChallenge(prisma, slug, user?.id ?? null)
  if (!challenge) notFound()

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-2xl">
        <Link href="/learn" className="font-mono text-xs text-muted-foreground hover:text-accent">
          ← back to path
        </Link>

        {challenge.owaspRef && (
          <p className="mt-6 font-mono text-xs uppercase tracking-wider text-accent">
            {challenge.owaspRef}
          </p>
        )}
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{challenge.title}</h1>
        <div className="mt-3 flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <DifficultyBadge difficulty={challenge.difficulty} />
          <span className="text-accent">{challenge.points} pts</span>
          <span aria-hidden>·</span>
          <span>{challenge.solveCount} solves</span>
        </div>

        <article className="mt-8">
          <Lesson markdown={challenge.description} />
        </article>

        {challenge.hints.length > 0 && (
          <details className="mt-8 rounded-md border border-border bg-surface p-4">
            <summary className="cursor-pointer font-mono text-sm text-muted-foreground hover:text-accent">
              [ hints ] {challenge.hints.length} available
            </summary>
            <ul className="mt-3 space-y-2">
              {challenge.hints.map((h) => (
                <li key={h.id} className="text-sm text-muted-foreground">
                  <span className="text-accent">›</span> {h.content}
                  {h.cost > 0 && <span className="ml-1 font-mono text-xs">(−{h.cost} pts)</span>}
                </li>
              ))}
            </ul>
          </details>
        )}

        <section className="mt-8">
          <BracketLabel className="mb-3">submit flag</BracketLabel>
          <SubmitFlag slug={challenge.slug} solved={challenge.solved} authed={user !== null} />
        </section>
      </div>
    </main>
  )
}
