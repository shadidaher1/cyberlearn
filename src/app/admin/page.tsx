import type { Metadata } from 'next'
import Link from 'next/link'

import { ChallengeTable } from '@/components/admin/challenge-table'
import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import { adminListChallenges } from '@/server/admin/challenges'

export const metadata: Metadata = { title: 'Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const challenges = await adminListChallenges(prisma)
  const published = challenges.filter((c) => c.published).length

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <BracketLabel>admin // console</BracketLabel>
          <Link href="/dashboard" className="font-mono text-xs text-muted-foreground hover:text-accent">
            dashboard →
          </Link>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Challenges</h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {published} published · {challenges.length} total
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/challenges/new">+ new challenge</Link>
          </Button>
        </div>

        <div className="mt-8">
          <ChallengeTable challenges={challenges} />
        </div>
      </div>
    </main>
  )
}
