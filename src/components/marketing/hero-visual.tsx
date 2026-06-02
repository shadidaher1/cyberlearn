import { TerminalFrame } from '@/components/brand/terminal-frame'

/**
 * The hero's right-side "live capture" card — shows the real product moment
 * (solving a challenge) with a floating points chip, a First-Blood unlock, and
 * an OWASP progress bar. Layered with soft glow for depth.
 */
export function HeroVisual() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-10 -z-10 rounded-[3rem] bg-accent/10 blur-3xl"
      />

      <div className="absolute -right-3 -top-5 z-10 rounded-lg border border-accent/40 bg-surface px-3.5 py-2 ring-glow">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">points</p>
        <p className="font-display text-2xl font-bold leading-none text-accent">+63</p>
      </div>

      <TerminalFrame label="~/web/a01 — broken access control" className="shadow-2xl">
        <p className="text-muted-foreground">
          <span className="text-accent">$</span> cyberlearn submit{' '}
          <span className="text-foreground">flag&#123;deny_by_default&#125;</span>
        </p>
        <p className="mt-2 text-success">[ CAPTURED ] first blood · +63 pts · rank ↑ 1</p>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>owasp top 10</span>
            <span className="text-accent">7 / 10</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[70%] rounded-full bg-accent" />
          </div>
        </div>
      </TerminalFrame>

      <div className="absolute -bottom-5 -left-4 z-10 flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 shadow-xl">
        <span className="flex size-7 items-center justify-center rounded-full bg-accent font-mono text-xs text-accent-foreground">
          ★
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            unlocked
          </p>
          <p className="text-sm font-medium">First Blood</p>
        </div>
      </div>
    </div>
  )
}
