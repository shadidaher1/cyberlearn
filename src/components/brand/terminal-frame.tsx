import { cn } from '@/lib/utils'

/**
 * Terminal-style framing for key snippets and CTAs — a titled window chrome
 * wrapping monospace content. One of the platform's signature devices.
 */
export function TerminalFrame({
  label = '~/cyberlearn',
  children,
  className,
}: {
  label?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-md border border-border bg-surface', className)}>
      <div className="flex items-center gap-2 border-b border-border bg-surface-raised px-4 py-2.5">
        <span aria-hidden className="size-2.5 rounded-full bg-destructive/70" />
        <span aria-hidden className="size-2.5 rounded-full bg-warning/70" />
        <span aria-hidden className="size-2.5 rounded-full bg-success/70" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed">{children}</div>
    </div>
  )
}
