import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ChallengeForm } from '@/components/admin/challenge-form'
import { BracketLabel } from '@/components/brand/bracket-label'
import { prisma } from '@/lib/db'
import { adminGetChallenge } from '@/server/admin/challenges'

export const metadata: Metadata = { title: 'Edit challenge' }
export const dynamic = 'force-dynamic'

export default async function EditChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [challenge, categories] = await Promise.all([
    adminGetChallenge(prisma, id),
    prisma.category.findMany({ orderBy: { order: 'asc' }, select: { slug: true, name: true } }),
  ])
  if (!challenge) notFound()

  return (
    <main className="min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin" className="font-mono text-xs text-muted-foreground hover:text-accent">
          ← admin
        </Link>
        <BracketLabel className="mt-6 block">edit challenge</BracketLabel>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{challenge.title}</h1>
        <div className="mt-8">
          <ChallengeForm
            categories={categories}
            initial={{
              id: challenge.id,
              slug: challenge.slug,
              title: challenge.title,
              description: challenge.description,
              owaspRef: challenge.owaspRef,
              difficulty: challenge.difficulty,
              points: challenge.points,
              published: challenge.published,
              categorySlug: challenge.category.slug,
            }}
          />
        </div>
      </div>
    </main>
  )
}
