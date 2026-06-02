import Link from 'next/link'

import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { Reveal } from '@/components/brand/reveal'
import { TerminalFrame } from '@/components/brand/terminal-frame'
import { Button } from '@/components/ui/button'

const categories = ['web', 'crypto', 'osint', 'forensics']

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      <GridBackdrop />

      <section className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-6 py-24">
        <Reveal>
          <BracketLabel>cyberlearn // training ground</BracketLabel>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Learn security by{' '}
            <span className="text-accent text-accent-glow">capturing flags</span>
            <span className="cursor-blink" aria-hidden />
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Hands-on challenges across web, crypto, OSINT and forensics. Real vulnerability
            classes, original content, a live leaderboard — and an AI mentor that teaches the{' '}
            <em className="font-medium not-italic text-foreground">why</em>, never the answer.
          </p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">Start training</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/learn">Explore the OWASP Top 10</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <TerminalFrame label="~/web/idor-01 — submit" className="mt-14 max-w-xl">
            <p className="text-muted-foreground">
              <span className="text-accent">$</span> cyberlearn submit{' '}
              <span className="text-foreground">flag&#123;c0nstant_t1me_w1ns&#125;</span>
            </p>
            <p className="mt-2 text-success">[ CAPTURED ] first blood · +250 pts · rank ↑ 3</p>
          </TerminalFrame>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3">
            {categories.map((category) => (
              <BracketLabel key={category}>{category}</BracketLabel>
            ))}
          </div>
        </Reveal>
      </section>

      <footer className="mx-auto max-w-5xl px-6 pb-10">
        <p className="font-mono text-xs text-muted-foreground">
          cyberlearn v0.1.0 · phase 0 — foundation · built with intent
        </p>
      </footer>
    </main>
  )
}
