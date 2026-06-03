import type { Metadata } from 'next'
import Link from 'next/link'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { PathCard } from '@/components/challenges/path-card'
import { prisma } from '@/lib/db'
import { getSession } from '@/server/auth/session'
import { listCatalog } from '@/server/challenges/queries'

export const metadata: Metadata = { title: 'Learn' }
export const dynamic = 'force-dynamic'

export default async function LearnPage() {
  const user = await getSession()
  const catalog = await listCatalog(prisma, user?.id ?? null)

  const allPaths = catalog.flatMap((c) => [...c.courses, ...c.ctf])
  const totalLessons = allPaths.reduce((n, p) => n + p.lessonCount, 0)
  const totalSolved = allPaths.reduce((n, p) => n + p.solvedCount, 0)

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <BracketLabel>learn</BracketLabel>
          <Link
            href="/dashboard"
            className="font-mono text-xs text-muted-foreground hover:text-accent"
          >
            dashboard →
          </Link>
        </div>

        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight">Learning paths</h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          Work through a course to learn the skill, then prove it in the capture-the-flag
          challenges. Every lesson ends in a flag.
        </p>
        <p className="mt-4 font-mono text-sm text-muted-foreground">
          <span className="text-accent">{totalSolved}</span> / {totalLessons} captured
        </p>

        {catalog.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-muted-foreground">
            No paths published yet. Run the seed to load the catalog.
          </p>
        ) : (
          <div className="mt-10 space-y-14">
            {catalog.map((cat) => (
              <section key={cat.slug}>
                <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
                  <h2 className="font-display text-2xl font-bold tracking-tight">{cat.name}</h2>
                  <span className="hidden font-mono text-xs text-muted-foreground sm:block">
                    {cat.description}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {cat.courses.map((p) => (
                    <PathCard key={p.slug} {...p} />
                  ))}
                </div>

                {cat.ctf.length > 0 && (
                  <div className="mt-6">
                    <BracketLabel className="mb-3">capture the flag</BracketLabel>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {cat.ctf.map((p) => (
                        <PathCard key={p.slug} {...p} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
