import { cn } from '@/lib/utils'

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block font-mono text-xs uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className={cn('font-mono text-xs text-destructive')}>{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
