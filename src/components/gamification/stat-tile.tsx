import { cn } from '@/lib/utils'

export function StatTile({
  label,
  value,
  accent,
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-3xl font-bold tracking-tight',
          accent && 'text-accent text-accent-glow',
        )}
      >
        {value}
      </p>
    </div>
  )
}
