<div align="center">

# CyberLearn

**Capture flags. Level up.**

A gamified cybersecurity learning platform — hands-on challenges, learning paths,
a live leaderboard, progress tracking, and an AI mentor that teaches the _why_,
never the answer.

`Next.js (App Router)` · `Prisma` · `Neon Postgres` · `Tailwind v4` · `Pusher` · `Vercel`

</div>

---

> **Note on architecture:** CyberLearn is a single all-in-one Next.js application.
> There is **no separate backend service**, **no Docker**, and **no live exploitable
> lab containers** — these are intentional exclusions. The backend is Next.js route
> handlers. See [`CLAUDE.md`](./CLAUDE.md) for the full rationale.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then fill in DATABASE_URL + DIRECT_URL from Neon

# 3. Generate the Prisma client + push the schema to your Neon database
npm run db:generate
npm run db:push

# 4. Run the dev server
npm run dev                 # http://localhost:3000
```

Health check: [`/api/health`](http://localhost:3000/api/health) returns service +
database status.

## Scripts

| Script                | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Start the dev server                          |
| `npm run build`       | Production build                              |
| `npm run typecheck`   | `tsc --noEmit`                                |
| `npm run lint`        | ESLint (next/core-web-vitals)                 |
| `npm run format`      | Prettier (with Tailwind class sorting)        |
| `npm run test`        | Vitest (run once)                             |
| `npm run db:generate` | Generate the Prisma client                    |
| `npm run db:push`     | Push schema to the database (no migration)    |
| `npm run db:migrate`  | Create + apply a dev migration                |
| `npm run db:seed`     | Seed the database (idempotent)                |
| `npm run db:studio`   | Open Prisma Studio                            |

## Documentation

The `docs/` folder is the source of truth and is read at the start of every work
session:

- [`CLAUDE.md`](./CLAUDE.md) — project overview, architecture, conventions, do-not-touch list
- [`docs/SCHEMA.md`](./docs/SCHEMA.md) — the Prisma data model + rationale
- [`docs/API.md`](./docs/API.md) — route-handler contract (endpoints, auth, rate limits)
- [`docs/SECURITY.md`](./docs/SECURITY.md) — the full security checklist
- [`docs/DESIGN.md`](./docs/DESIGN.md) — the visual identity + design tokens
- [`docs/GAMIFICATION.md`](./docs/GAMIFICATION.md) — scoring, ranks, achievements, fairness rules

## License

All challenge and lesson content is original, authored through the admin
dashboard. Not for redistribution.
