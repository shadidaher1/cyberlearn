# DESIGN.md — CyberLearn visual identity

The "not generic" mandate, made concrete. Every screen follows this. Tokens are
defined in `src/app/globals.css`; **components reference tokens, never raw values.**

## Principle

A hacker's terminal, elevated and **designed** — not edgy-cliché. Calm dark
canvas, generous negative space, hairline structure, and one confident accent
that earns attention because it's used sparingly. The reward for capturing a flag
should feel _earned_, not loud.

**Explicitly rejected:** untouched shadcn slate-and-white; the generic SaaS
gradient hero; Inter-as-the-only-font; the evenly-spaced feature-card grid; heavy
drop-shadows; pure-black backgrounds; matrix-green-on-black cliché.

## Colour — cool ink + one signal-lime accent

Authored in **OKLCH** so the surface ladder steps in even perceptual lightness.
Dark-by-default; `color-scheme: dark`.

| Token                  | OKLCH                      | Role                                   |
| ---------------------- | -------------------------- | -------------------------------------- |
| `--background`         | `0.16 0.014 256`           | page — tinted ink, never `#000`        |
| `--surface`            | `0.20 0.016 256`           | cards, panels                          |
| `--surface-raised`     | `0.235 0.017 256`          | popovers, window chrome                |
| `--border`             | `0.30 0.016 256`           | 1px hairlines (our primary structure)  |
| `--muted-foreground`   | `0.68 0.018 256`           | secondary text, metadata               |
| `--foreground`         | `0.95 0.008 256`           | primary text                           |
| `--accent` (lime)      | `0.88 0.205 128`           | active / success / **captured flag**   |
| `--accent-foreground`  | `0.18 0.03 256`            | text on the accent                     |
| `--warning`            | `0.82 0.15 80`             | amber — caution                        |
| `--destructive`        | `0.62 0.21 25`             | red — errors, danger                   |

**Accent discipline:** the lime is a scalpel. One primary action per view, the
captured-flag moment, an active nav item, a focus ring. If two limes compete on a
screen, one is wrong. `--success` aliases `--accent` on purpose — solving _is_ the
brand moment.

## Typography — contrast by role

- **Display / headings —** `Space Grotesk` (`font-display`). Geometric, a little
  quirky, technical. Tight tracking at large sizes.
- **Body —** `IBM Plex Sans` (`font-sans`). Clean, humanist, professional —
  deliberately not Inter-as-the-only-font.
- **Mono —** `JetBrains Mono` (`font-mono`). **The recurring brand motif.** Used
  for flags, points, ranks, IDs, timestamps, code, and the `[ ]` labels. If a
  value is a fact the machine produced, it's mono.

All three load via `next/font` (self-hosted, no CDN, no layout shift).

## Signature devices (use these repeatedly)

1. **Bracketed labels** — `[ LABEL ]` in mono, brackets in accent, text muted.
   Section eyebrows, category chips, status tags. → `components/brand/bracket-label.tsx`
2. **Terminal framing** — titled window chrome around key snippets/CTAs. → `terminal-frame.tsx`
3. **Blueprint grid backdrop** — faint grid, radially masked. → `grid-backdrop.tsx`
4. **Blinking cursor** — `.cursor-blink` after a heading; reduced-motion safe.
5. **Hairline + glow elevation** — `.ring-glow` (inset 1px border + soft accent
   bloom) instead of heavy box-shadows.

## Spacing, radius, borders

- **Radius:** small and crisp — `--radius: 0.4rem` (≈6px). Technical, not pill-soft.
- **Borders:** 1px hairlines (`--border`) are the main way we separate things;
  prefer a border over a shadow.
- **Spacing:** generous and consistent; lean on the Tailwind 4-point scale, plenty
  of breathing room around headlines and primary actions.

## Motion (Framer Motion)

- Purposeful and short. Entrances: 0.6s, ease `[0.16, 1, 0.3, 1]` (expo-out).
- **Always respect `prefers-reduced-motion`** — render static, never force motion
  (see `components/brand/reveal.tsx`).
- Reserve the richest motion for **rewarding moments** (below).

## Rewarding moments (choreography)

- **Capture a flag —** the submit field resolves to a `[ CAPTURED ]` state in
  accent, points count up, a subtle glow pulse. Satisfying, ~1s, not confetti-loud.
- **Climb the leaderboard —** the user's row animates its rank delta (`↑ 3`) and
  briefly accent-outlines.
- **Unlock an achievement —** a mono toast with the achievement glyph; first-blood
  gets a one-time stronger pulse.

## Components — direction

- **Buttons —** primary = solid lime, mono uppercase, `.ring-glow`. Secondary =
  hairline outline that turns accent on hover. Ghost for tertiary.
- **Inputs —** ink surface, hairline border, accent focus ring; mono for
  flag/code inputs.
- **Cards —** surface + hairline border; accent only to signal state (solved,
  active), never as default decoration.
- **Empty / loading / error states are designed, not afterthoughts.** Every list
  and async view ships all three with consistent, tasteful microcopy.

## Microcopy voice

Terse, technical, lightly wry — never cutesy. Lowercase mono for system/terminal
lines (`cd ~`, `[ CAPTURED ]`); sentence case for human-facing prose. Examples in
`not-found.tsx` / `error.tsx`.

## Accessibility

- Maintain WCAG-AA contrast (the ink/foreground ladder is built for it; verify
  lime-on-ink for text vs. large-only use).
- Visible `:focus-visible` ring everywhere (accent, 2px, offset).
- Honour reduced-motion. Don't encode meaning in colour alone — pair the lime
  "solved" state with an icon/label.
