# SECURITY.md — CyberLearn security checklist

Non-negotiable, applies to every phase. Status legend: ✅ done · 🔧 in progress ·
📋 planned (phase noted). This file is updated **on the same branch** as the
change that affects it.

---

## 1. Input validation & error handling

- ✅ Validate **all** input with **Zod** at the route-handler boundary; reject
  with the correct status (`400` malformed, `401`/`403` authz, `404`, `409`
  conflict, `422` semantic, `429` rate-limited).
- ✅ Zod schemas live in `src/schemas` and are shared between client forms and
  handlers — one source of truth, no drift.
- ✅ **Never leak internals.** No stack traces, Prisma errors, or env values in
  responses. The client error boundary (`src/app/error.tsx`) logs server-side
  and shows a generic message. Responses use the `{ ok, error: { code, message } }`
  envelope with safe, generic messages.

## 2. Authentication & sessions (Phase 1)

- ✅ Passwords hashed with **argon2id** (`@node-rs/argon2`). Cost params per OWASP
  and encoded in the hash, so they can be raised later without invalidating
  existing hashes. `verifyPassword` never throws (returns `false`).
- ✅ **JWT** via `jose`: short-lived **access** token (15m) + a longer-lived
  **rotating refresh** token (30d). Rotation detects reuse — a replayed
  (already-rotated) token revokes the whole family.
- ✅ Tokens in **httpOnly + Secure(prod) + SameSite=Lax** cookies. **Never**
  `localStorage`/`sessionStorage`.
- ✅ Refresh tokens stored **hashed** (SHA-256) in the DB; the raw token only ever
  lives in the cookie. A DB leak yields no usable tokens.
- ✅ **No login enumeration:** unknown email and wrong password both return a
  generic `401`, with a constant-time dummy argon2 verify so timing can't reveal
  whether the account exists. _(Registration intentionally reports email/username
  conflicts for UX — a lower-value vector mitigated by rate-limiting; password
  reset will be generic in its sub-step.)_
- ✅ Centralised `getSession` / `requireUser` / `requireAdmin` in `src/server/auth`.
  Authorization is enforced in the service layer, not the UI.
- 📋 **GitHub OAuth:** validate the `state` parameter (CSRF), keep the client
  secret server-side, exchange the code server-side only.
- 📋 **Email verification & password reset** tokens: random, **hashed** at rest,
  **single-use** (`consumedAt`), **expiring**. Lookups by hash.

## 3. Flag handling (Phase 2) — the core invariant

- 📋 The flag is stored as **`HMAC-SHA256(normalize(flag), FLAG_PEPPER)`** (hex),
  never plaintext.
  - **Why HMAC, not argon2:** flags are verified on *every* submission under rate
    limiting; a deliberately-slow KDF would add latency and a DoS surface. A
    keyed hash with a server-side pepper gives pre-image/rainbow resistance
    cheaply. The pepper is a server secret (`FLAG_PEPPER`), never in the DB.
  - **Why HMAC, not plain SHA-256:** without the secret pepper, a stolen DB plus
    a guessed flag format is brute-forceable; the pepper defeats that.
  - `normalize` = trim + Unicode-normalise (and, per-challenge, optional
    case-folding) so legitimate answers match without weakening the hash.
- 📋 Comparison is **constant-time** (`crypto.timingSafeEqual` on equal-length
  buffers) to avoid timing oracles.
- 📋 The flag (or a submitted attempt that equals it) appears in **no** response,
  **no** log, **no** error — **not even on success.** Success returns points and
  state, never the flag. Submitted attempts are not logged verbatim.
- 📋 Per-user / per-challenge **rate limiting** on submission (anti-brute-force).

## 4. Atomicity & data integrity (Phases 2–3)

- 📋 A correct submission records the solve **inside a single transaction**:
  insert `Solve` → award points → update denormalized `Score` → evaluate
  achievements. All-or-nothing.
- 📋 **Solve-once / award-once enforced by DB constraints**, not just code:
  - `Solve` has `@@unique([userId, challengeId])` — a second correct submission
    hits the constraint and is treated as "already solved" (no double points).
  - `UserAchievement` has `@@unique([userId, achievementId])`.
- 📋 The concurrency test fires **two simultaneous correct submissions** for the
  same challenge and asserts points are awarded **exactly once**.
- 📋 **First blood** is decided atomically inside the transaction (see
  `docs/GAMIFICATION.md`), never with a racy read-then-write.

## 5. Authorization (every phase)

- 📋 Every **mutating** and **admin** route is guarded **server-side** with
  `requireUser` / `requireAdmin`. Assume endpoints are called directly, not just
  through the UI — hiding a button is not access control.
- 📋 Role checks (`USER` / `ADMIN`) happen in the service layer before any write.
- 📋 IDOR-safe: object access is always scoped to the authenticated user (or
  admin), never trusting an ID from the request alone.

## 6. Rate limiting (Phases 1, 2, 6)

- 🔧 **Upstash Redis** (durable; serverless has no shared in-memory state) via
  `@upstash/ratelimit`. Applied to: auth endpoints (login, register, reset),
  flag submission (per user + per challenge), and the AI mentor. _An in-memory
  dev fallback (`src/lib/rate-limit.ts`) is live on register/login today; it
  swaps to Upstash, behind the same async interface, once `UPSTASH_*` is set._
- 📋 Keyed by user id where authenticated, else by a hashed IP. Return `429` with
  `Retry-After`.

## 7. Secrets & headers

- ✅ Secrets only in env (`.env`, git-ignored). `.env.example` carries
  placeholders only. Never in the repo, logs, URLs, query strings, or the client
  bundle. `NEXT_PUBLIC_*` is the only client-exposed prefix and never holds secrets.
- ✅ **Security headers** in `next.config.ts`:
  `Content-Security-Policy`, `Strict-Transport-Security` (HSTS, preload),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- 🔧 **CSP hardening:** the baseline CSP allows `'unsafe-inline'` for scripts to
  stay Next-compatible. Phase 1 upgrades to a **nonce-based** CSP via middleware.

## 8. Database

- ✅ Single **Prisma client singleton** (`src/lib/db.ts`).
- ✅ **Pooled** Neon URL (`DATABASE_URL`) at runtime; **direct** URL
  (`DIRECT_URL`) for migrations only.
- 📋 Never run destructive migrations against production; migrate a dev/preview
  branch first (Neon branching gives isolated DBs).
- Parameterised queries via Prisma by default; any `$queryRaw` uses tagged
  templates (never string-concatenated SQL).

## 9. AI mentor (Phase 6)

- 📋 Server-side proxy only; the **Anthropic API key is server-only**.
- 📋 Authenticated + **rate-limited**; user input is **length-bounded**.
- 📋 **The flag is never placed in the prompt context.** The mentor teaches
  concepts and explains *why* an approach is flawed; it never reveals a flag or a
  challenge-specific solution.
- 📋 User input is untrusted: a system prompt + guardrails resist jailbreak
  attempts toward the answer; refusals are logged (without the user's raw payload
  if sensitive).

## 10. Testing priorities (see `docs/` per phase)

- 📋 Prioritise **auth** and **flag-submission/scoring** above all else.
- 📋 Concurrency test: two correct submissions → points once.
- 📋 Explicit assertion: **the flag never appears in any API response.**
- 📋 Integration tests run against a **dedicated test database**, never production.
- 📋 Tests are deterministic, isolated, and named by behavior.
