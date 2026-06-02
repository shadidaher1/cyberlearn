import Link from 'next/link'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { Reveal } from '@/components/brand/reveal'
import { SiteHeader } from '@/components/layout/site-header'
import { HeroVisual } from '@/components/marketing/hero-visual'
import { Button } from '@/components/ui/button'
import { getSession } from '@/server/auth/session'

export const dynamic = 'force-dynamic'

const TRACKS = ['web', 'crypto', 'osint', 'forensics', 'reverse eng', 'linux', 'networking']

export default async function Home() {
  const user = await getSession()
  const authed = user !== null

  return (
    <>
      <SiteHeader authed={authed} />

      <main className="relative isolate overflow-hidden">
        <GridBackdrop />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-[44rem] -translate-x-1/2 rounded-full bg-accent/[0.06] blur-3xl"
        />

        <section className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col px-6">
          <div className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-2 lg:gap-8">
            {/* Left — copy */}
            <div>
              <Reveal>
                <BracketLabel>cyberlearn // training ground</BracketLabel>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="mt-6 max-w-xl font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
                  Master cybersecurity by{' '}
                  <span className="text-accent text-accent-glow">capturing flags</span>
                  <span className="cursor-blink" aria-hidden />
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Hands-on labs, guided learning paths, and real challenges across web, crypto,
                  OSINT and forensics — all in your browser. Track your progress, climb the
                  leaderboard, and learn the{' '}
                  <em className="font-medium not-italic text-foreground">why</em> from an AI mentor
                  that never hands you the answer.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button asChild size="lg">
                    <Link href={authed ? '/dashboard' : '/register'}>Start Training</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/learn">Browse Paths</Link>
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <span className="text-accent">✓</span> No VMs or setup
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-accent">✓</span> 100% original content
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-accent">✓</span> Free to start
                  </li>
                </ul>
              </Reveal>
            </div>

            {/* Right — live capture card */}
            <Reveal delay={0.2} className="hidden lg:block">
              <HeroVisual />
            </Reveal>
          </div>

          {/* Tracks strip */}
          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/60 py-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                tracks
              </span>
              {TRACKS.map((t) => (
                <BracketLabel key={t}>{t}</BracketLabel>
              ))}
            </div>
          </Reveal>
        </section>
      </main>
    </>
  )
}
