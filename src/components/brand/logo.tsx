import { cn } from '@/lib/utils'

/**
 * CyberLearn mark — a flagstaff flying a `>` chevron. Reads as a captured flag
 * (CTF), a terminal prompt, and a forward/progress arrow at once. Uses design
 * tokens (foreground staff + accent chevron) so it themes automatically and
 * scales cleanly to a favicon.
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn('size-7', className)}>
      <rect x="8" y="4" width="2.6" height="24" rx="1.3" className="fill-foreground" />
      <path
        d="M11.5 7 L21.5 12 L11.5 17"
        className="stroke-accent"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Wordmark({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoIcon className={iconClassName} />
      <span className="font-display text-lg font-bold tracking-tight">
        Cyber<span className="text-accent">Learn</span>
      </span>
    </span>
  )
}
