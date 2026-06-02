import { cn } from '@/lib/utils'
import type { AchievementStatus } from '@/server/challenges/achievements'

export function AchievementGrid({ achievements }: { achievements: AchievementStatus[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {achievements.map((a) => (
        <div
          key={a.slug}
          className={cn(
            'flex items-start gap-3 rounded-lg border p-3 transition-colors',
            a.earned ? 'border-accent/40 bg-accent-muted' : 'border-border bg-surface opacity-60',
          )}
        >
          <span
            className={cn(
              'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-sm',
              a.earned ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
            )}
            aria-hidden
          >
            {a.earned ? '✓' : '·'}
          </span>
          <div className="min-w-0">
            <p className={cn('font-medium', a.earned ? 'text-foreground' : 'text-muted-foreground')}>
              {a.name}
            </p>
            <p className="text-xs text-muted-foreground">{a.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
