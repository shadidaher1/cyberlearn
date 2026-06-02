'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { DifficultyBadge } from '@/components/challenges/difficulty-badge'
import { cn } from '@/lib/utils'

interface Row {
  id: string
  slug: string
  title: string
  owaspRef: string | null
  difficulty: string
  points: number
  published: boolean
  solveCount: number
  category: { name: string; slug: string }
}

export function ChallengeTable({ challenges }: { challenges: Row[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function mutate(id: string, init: RequestInit) {
    setBusy(id)
    try {
      await fetch(`/api/admin/challenges/${id}`, init)
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  if (challenges.length === 0) {
    return <p className="font-mono text-sm text-muted-foreground">No challenges yet.</p>
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {challenges.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-surface px-4 py-3">
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              c.published ? 'bg-success' : 'bg-muted-foreground/40',
            )}
            title={c.published ? 'published' : 'draft'}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{c.title}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {c.slug} · {c.category.name}
            </p>
          </div>
          <DifficultyBadge difficulty={c.difficulty} />
          <span className="font-mono text-xs text-accent">{c.points}p</span>
          <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
            {c.solveCount} solved
          </span>
          <button
            type="button"
            onClick={() => mutate(c.id, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ published: !c.published }),
            })}
            disabled={busy === c.id}
            className="font-mono text-xs text-muted-foreground hover:text-accent disabled:opacity-50"
          >
            {c.published ? 'unpublish' : 'publish'}
          </button>
          <Link
            href={`/admin/challenges/${c.id}/edit`}
            className="font-mono text-xs text-muted-foreground hover:text-accent"
          >
            edit
          </Link>
          <button
            type="button"
            onClick={() => mutate(c.id, { method: 'DELETE' })}
            disabled={busy === c.id}
            className="font-mono text-xs text-destructive hover:underline disabled:opacity-50"
          >
            delete
          </button>
        </div>
      ))}
    </div>
  )
}
