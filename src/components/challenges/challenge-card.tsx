import { Check } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

import { DifficultyBadge } from './difficulty-badge'

interface Props {
  slug: string
  title: string
  owaspRef: string | null
  difficulty: string
  points: number
  solveCount: number
  solved: boolean
}

export function ChallengeCard({
  slug,
  title,
  owaspRef,
  difficulty,
  points,
  solveCount,
  solved,
}: Props) {
  return (
    <Link
      href={`/challenges/${slug}`}
      className={cn(
        'group block rounded-lg border bg-surface p-4 transition-colors hover:border-accent/50',
        solved ? 'border-accent/40' : 'border-border',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {owaspRef && (
            <p className="truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {owaspRef}
            </p>
          )}
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight group-hover:text-accent">
            {title}
          </h3>
        </div>
        {solved && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Check className="size-3.5" aria-label="solved" />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3 font-mono text-xs text-muted-foreground">
        <DifficultyBadge difficulty={difficulty} />
        <span className="text-accent">{points} pts</span>
        <span aria-hidden>·</span>
        <span>{solveCount} solves</span>
      </div>
    </Link>
  )
}
