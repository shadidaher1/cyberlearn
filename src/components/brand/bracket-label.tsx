import { cn } from '@/lib/utils'

/**
 * `[ LABEL ]` — the recurring bracketed, monospace section marker. The brackets
 * carry the accent; the text stays muted so the motif reads as structure, not noise.
 */
export function BracketLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground',
        className,
      )}
    >
      <span aria-hidden className="text-accent">
        [
      </span>
      {children}
      <span aria-hidden className="text-accent">
        ]
      </span>
    </span>
  )
}
