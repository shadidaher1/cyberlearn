import { cn } from '@/lib/utils'

/**
 * Signature blueprint grid, faded out by a radial mask. Purely decorative —
 * sits behind content and never intercepts pointer events.
 */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 -z-10 bg-grid',
        '[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]',
        className,
      )}
    />
  )
}
