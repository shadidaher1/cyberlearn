import type { Metadata } from 'next'
import Link from 'next/link'

import { ChallengeForm } from '@/components/admin/challenge-form'
import { BracketLabel } from '@/components/brand/bracket-label'
import { prisma } from '@/lib/db'

export const metadata: Metadata = { title: 'New challenge' }
export const dynamic = 'force-dynamic'

export default async function NewChallengePage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { slug: true, name: true },
  })

  return (
    <main className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin" className="font-mono text-xs text-muted-foreground hover:text-accent">
          ← admin
        </Link>
        <BracketLabel className="mt-6 block">new challenge</BracketLabel>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Author a challenge</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Write the lesson in markdown. The flag is hashed (HMAC) before storage.
        </p>
        <div className="mt-8">
          <ChallengeForm categories={categories} />
        </div>
      </div>
    </main>
  )
}
