import Link from 'next/link'

import type { PathKind } from '@/config/learning'
import { cn } from '@/lib/utils'

import { DifficultyBadge } from './difficulty-badge'

interface Props {
  slug: string
  title: string
  summary: string
  difficulty: string
  kind: PathKind
  lessonCount: number
  solvedCount: number
}

export function PathCard({
  slug,
  title,
  summary,
  difficulty,
  kind,
  lessonCount,
  solvedCount,
}: Props) {
  const complete = lessonCount > 0 && solvedCount === lessonCount
  const pct = lessonCount > 0 ? Math.round((solvedCount / lessonCount) * 100) : 0

  return (
    <Link
      href={`/learn/${slug}`}
      className={cn(
        'group block rounded-lg border bg-surface p-5 transition-colors hover:border-accent/50',
        complete ? 'border-accent/40' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <DifficultyBadge difficulty={difficulty} />
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {kind === 'CTF' ? 'ctf' : `${lessonCount} lessons`}
        </span>
      </div>

      <h3 className="mt-3 font-display text-xl font-semibold tracking-tight group-hover:text-accent">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-pretty text-muted-foreground">{summary}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
          <span>
            <span className="text-accent">{solvedCount}</span> / {lessonCount} captured
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}
