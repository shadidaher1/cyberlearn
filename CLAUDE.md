# CLAUDE.md — CyberLearn project context

> Read this first, every session. It is the source of truth for **how** this
> project is built. Detailed contracts live in `docs/`.

## What this is

**CyberLearn** is a gamified cybersecurity learning platform — hands-on
flag-capture challenges, learning paths, a live leaderboard, progress tracking,
and an AI mentor. It is a flagship portfolio project: **code quality, security
hygiene, clean architecture, and a distinctive hand-crafted UI matter as much as
features.** It must never read as a generic template or AI boilerplate.

## Architecture (fixed)

A single **all-in-one Next.js (App Router)** application. The "backend" is route
handlers (`src/app/api/**/route.ts`) in the same project. Internally there are
three layers:

```
HTTP edge        src/app/api/**/route.ts   thin: parse → Zod-validate → call service → format
Domain/services  src/server/**             business rules: scoring, solve-once, transactions (no HTTP)
Data             Prisma → Neon Postgres     one client singleton; pooled URL at runtime, direct URL for migrations
```

**Why the domain layer:** the security-critical rules (constant-time flag
compare, atomic solve-once, award-once) live as plain functions taking
`(prisma, input)`. That makes them unit/integration-testable without HTTP, and
keeps every sensitive operation in one auditable place. Route handlers stay thin.

### Fixed stack — do not deviate without asking

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js App Router (one app, route handlers)      |
| Database       | PostgreSQL on **Neon** via **Prisma**             |
| Auth           | JWT (access + rotating refresh) in httpOnly cookies; GitHub OAuth; email verification; argon2id via `@node-rs/argon2`; JWT via `jose` |
| Realtime       | **Pusher** (managed) — not self-hosted sockets    |
| Rate limiting  | **Upstash Redis** (durable, serverless-safe)      |
| Validation     | **Zod**, schemas shared client/route handler      |
| Styling        | **Tailwind v4** (CSS-first tokens) + shadcn/ui (new-york), Framer Motion |
| Email          | **Resend**                                        |
| AI mentor      | Anthropic API via a server-side proxy             |
| Testing        | **Vitest** + Testing Library                      |
| Deploy         | **Vercel** (whole app) + **Neon**                 |

### Intentional exclusions (do NOT add)

- **No Docker.** Anywhere.
- **No separate backend service** (no NestJS). The API is route handlers.
- **No live exploitable lab containers.** Out of scope; the machine is storage-constrained.
- No self-hosted Socket.IO (serverless can't hold sockets — that's why Pusher).
- No tokens in `localStorage` — ever. This app teaches XSS; it practices what it preaches.

**Ask before adding any dependency outside the table above.**

## Locked decisions (Phase 0)

- **Accent:** one signal-lime accent (`oklch(0.88 0.205 128)`) that doubles as
  active / success / captured-flag. No second "reserved" colour.
- **Type:** Space Grotesk (display) · IBM Plex Sans (body) · JetBrains Mono (the
  recurring brand motif). All via `next/font` — no webfont CDN.
- **Colour authored in OKLCH**, not hex, for a perceptually-even surface ladder.
- **Flags** are stored as `HMAC-SHA256(normalize(flag), FLAG_PEPPER)` and compared
  in constant time — never argon2 (too slow per-submission), never plaintext. See
  `docs/SECURITY.md` for the rationale.
- **Auth tokens & email/reset tokens** are stored hashed (SHA-256), single-use,
  expiring.

## Repo structure

```
src/
  app/
    layout.tsx · globals.css (design tokens) · page.tsx · not-found.tsx · error.tsx
    api/**/route.ts            HTTP edge — thin handlers
  components/
    brand/                     signature motifs (BracketLabel, TerminalFrame, GridBackdrop, Reveal)
    ui/                        shadcn primitives, restyled to the tokens
  server/                      domain/service layer (auth, challenges, scoring) — never imported by client
  lib/                         env, db (Prisma singleton), api (response envelope), utils
  schemas/                     shared Zod schemas
  config/                      non-secret config (rank thresholds, point tiers)
prisma/                        schema.prisma, migrations, seed.ts
tests/                         unit + integration (dedicated test DB)
docs/                          SCHEMA · API · SECURITY · DESIGN · GAMIFICATION
```

## Conventions

- **Route handlers are thin.** Parse → validate with Zod → call a `src/server`
  service → format with `src/lib/api.ts` (`ok` / `fail`). No business logic in handlers.
- **Validate all input with Zod.** Reject with the correct status. Never leak
  stack traces or internal errors to the client.
- **`import 'server-only'`** at the top of any module that must never reach the
  client bundle (env, db, services). Secrets live only in env.
- **One response envelope:** `{ ok: true, ... }` or `{ ok: false, error: { code, message } }`.
- **Naming:** files `kebab-case`; React components `PascalCase`; functions/vars
  `camelCase`; Prisma models `PascalCase`, tables `@@map`'d to `snake_case` plural.
- **Code style:** Prettier — no semicolons, single quotes, trailing commas,
  width 100. Tailwind classes are auto-sorted. Run `npm run format`.
- **Tokens only.** No ad-hoc hex or magic pixel values in components — use the
  design tokens (`docs/DESIGN.md`).

## Security rules (summary — full list in `docs/SECURITY.md`)

- argon2id passwords; JWT in httpOnly + Secure + SameSite cookies; rotating refresh.
- Constant-time flag compare; flag stored as a hash; flag never in any response, log, or error.
- Score & achievement writes are atomic/transactional; solve-once & award-once
  enforced by **DB constraints**, not just code.
- Every mutating/admin route is guarded **server-side** (assume direct calls).
- Rate-limit auth, flag submission, and the AI mentor with Upstash.
- Security headers set in `next.config.ts` (CSP/HSTS/nosniff/frame-ancestors/…).
- Single Prisma client singleton; pooled URL at runtime, direct URL for migrations;
  never run destructive migrations against production.

## Do NOT touch without explicit approval

- The fixed stack and intentional exclusions above.
- `prisma/migrations/**` already applied (never edit a shipped migration; add a new one).
- Auth, flag-comparison, and scoring/transaction code without a test proving the
  invariant still holds.
- Anything that would place a secret or a flag into the client bundle, a log, a
  URL, or a response.
- Git history: no force-push, history rewrite, or branch deletion without a go-ahead.

## Running it

```bash
npm install
cp .env.example .env          # fill DATABASE_URL + DIRECT_URL from Neon
npm run db:generate && npm run db:push
npm run dev                   # http://localhost:3000  ·  health: /api/health
```

Other scripts: `typecheck`, `lint`, `format`, `test`, `db:migrate`, `db:studio`, `db:seed`.

## Git workflow

- `main` is always deployable. **Never commit feature work directly to `main`.**
- One branch per phase: `chore/scaffold`, `feat/auth`, `feat/challenges`,
  `feat/gamification`, `feat/admin`, `feat/realtime`, `feat/ai-mentor` (+ `fix/…`, `docs/…`).
- **Conventional Commits**, small and logical (`feat(auth): add argon2id hashing`).
- Update the relevant `docs/` file **on the same branch** as the change.
- No irreversible git ops (force-push, rewrite, delete) without explicit approval.

## Build phases

0. **Foundation** (`chore/scaffold`) — scaffold, docs, tokens, health route. ← current
1. **Auth & users** (`feat/auth`) — register/login, argon2id, JWT cookies, GitHub
   OAuth, email verification, password reset, rate limiting. Tests for auth paths.
2. **Core learning domain** (`feat/challenges`) — challenge CRUD, flag submission
   (constant-time, hashed, atomic solve-once). Tests for solve-once & flag-never-leaks.
3. **Gamification** (`feat/gamification`) — points, leaderboard (deterministic
   tie-break), ranks, achievements (award-once).
4. **Admin dashboard** (`feat/admin`) — manage content/users; server-side RBAC.
5. **Realtime + UI polish** (`feat/realtime`) — Pusher events after DB commit;
   loading/empty/error states everywhere.
6. **AI mentor** (`feat/ai-mentor`) — server-side LLM proxy; never reveals flags;
   rate-limited; resists jailbreaks.

## Database notes

- `DATABASE_URL` = pooled (PgBouncer) for runtime; `DIRECT_URL` = direct for
  migrations. Both from Neon.
- One Prisma client (`src/lib/db.ts`), cached on `globalThis` in dev.
- Run migrations against a dev/preview branch first. **Never** a destructive
  migration on production data. Neon database branching gives isolated test DBs.
