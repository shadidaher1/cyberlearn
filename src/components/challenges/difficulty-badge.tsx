import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  EASY: 'border-border text-muted-foreground',
  MEDIUM: 'border-warning/30 bg-warning/5 text-warning',
  HARD: 'border-destructive/30 bg-destructive/5 text-destructive',
  INSANE: 'border-accent/40 bg-accent-muted text-accent',
}

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider',
        STYLES[difficulty] ?? STYLES.EASY,
        className,
      )}
    >
      {difficulty.toLowerCase()}
    </span>
  )
}
