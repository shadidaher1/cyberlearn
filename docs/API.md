# API.md — CyberLearn route-handler contract

All endpoints are Next.js route handlers under `src/app/api/**/route.ts`.
**Phase 0 ships only `/api/health`**; the rest is the contract Phase 1+ implements.

## Conventions

- **Auth column:** `public` · `user` (valid access token) · `admin` (role ADMIN).
  Enforced **server-side** in the service layer — never the UI alone.
- **Validation:** every body/query parsed with a Zod schema from `src/schemas`.
- **Responses:** `{ ok: true, ... }` on success; `{ ok: false, error: { code, message } }`
  on failure. Helpers: `src/lib/api.ts` (`ok` / `fail`).
- **Status codes:** `400` malformed · `401` unauthenticated · `403` forbidden ·
  `404` not found · `409` conflict · `422` semantic · `429` rate-limited.
- **Cookies:** access + refresh tokens are httpOnly/Secure/SameSite cookies set by
  auth handlers — never returned in the JSON body.
- **Rate-limited** endpoints are marked ⏱ and return `429` + `Retry-After`.

## Health — Phase 0 ✅

| Method | Path          | Auth   | Notes                                    |
| ------ | ------------- | ------ | ---------------------------------------- |
| GET    | `/api/health` | public | `{ ok, status, database, latencyMs }`; `503` if DB down |

## Auth — Phase 1 ✅ (password flow implemented; OAuth + email pending)

| Method | Path                          | Auth   | Body / notes                                    |
| ------ | ----------------------------- | ------ | ----------------------------------------------- |
| POST   | `/api/auth/register` ⏱        | public | `{ email, username, password }` → creates user, sends verify email. Generic success. |
| POST   | `/api/auth/login` ⏱           | public | `{ email, password }` → sets cookies. Generic failure, constant-time. |
| POST   | `/api/auth/logout`            | user   | revokes refresh token, clears cookies           |
| POST   | `/api/auth/refresh`           | public | rotates refresh (cookie); detects reuse         |
| POST   | `/api/auth/verify-email`      | public | `{ token }` — single-use, hashed, expiring      |
| POST   | `/api/auth/resend-verification` ⏱ | public | `{ email }` — generic success               |
| POST   | `/api/auth/forgot-password` ⏱ | public | `{ email }` — generic success                   |
| POST   | `/api/auth/reset-password` ⏱  | public | `{ token, password }`                           |
| GET    | `/api/auth/github`            | public | redirect to GitHub; sets signed `state`         |
| GET    | `/api/auth/github/callback`   | public | validates `state`, exchanges code server-side   |
| GET    | `/api/auth/session`           | public | `{ user } \| { user: null }`                    |

## Profile — Phase 1

| Method | Path                | Auth | Notes                          |
| ------ | ------------------- | ---- | ------------------------------ |
| GET    | `/api/me`           | user | current profile                |
| PATCH  | `/api/me`           | user | `{ username?, bio?, avatarUrl? }` |
| GET    | `/api/users/:username` | public | public profile + stats      |

## Content (read) — Phase 2

| Method | Path                       | Auth   | Notes                                  |
| ------ | -------------------------- | ------ | -------------------------------------- |
| GET    | `/api/categories`          | public | list                                   |
| GET    | `/api/paths`               | public | list learning paths                    |
| GET    | `/api/paths/:slug`         | public | path + ordered challenges (+ user progress if authed) |
| GET    | `/api/challenges`          | user   | list (filter by category/path/difficulty); **never** returns `flagHash` |
| GET    | `/api/challenges/:slug`    | user   | detail + hints (locked) + solved state |

## Submission & hints — Phase 2/3

| Method | Path                                | Auth | Notes                                           |
| ------ | ----------------------------------- | ---- | ----------------------------------------------- |
| POST   | `/api/challenges/:slug/submit` ⏱    | user | `{ flag }` → constant-time compare; atomic solve. Returns `{ correct, awardedPoints?, firstBlood? }` — **never the flag**. |
| POST   | `/api/challenges/:slug/hints/:id/unlock` | user | spends hint cost (once)                    |

## Gamification (read) — Phase 3

| Method | Path                       | Auth   | Notes                                          |
| ------ | -------------------------- | ------ | ---------------------------------------------- |
| GET    | `/api/leaderboard`         | public | ranked by `(points DESC, lastSolveAt ASC, userId ASC)`; paginated |
| GET    | `/api/me/progress`         | user   | completion % per path/category                 |
| GET    | `/api/achievements`        | public | catalogue                                      |
| GET    | `/api/users/:username/achievements` | public | unlocked achievements                 |

## Admin — Phase 4 (all `admin`, all audited)

| Method            | Path                         | Notes                          |
| ----------------- | ---------------------------- | ------------------------------ |
| POST/PATCH/DELETE | `/api/admin/challenges[/:id]`| CRUD; flag accepted plaintext on write, **hashed before persist**, never returned |
| POST/PATCH/DELETE | `/api/admin/categories[/:id]`| CRUD                           |
| POST/PATCH/DELETE | `/api/admin/paths[/:id]`     | CRUD + ordering                |
| POST/PATCH/DELETE | `/api/admin/hints[/:id]`     | CRUD                           |
| POST/PATCH/DELETE | `/api/admin/announcements[/:id]` | CRUD                       |
| GET/PATCH         | `/api/admin/users[/:id]`     | list / change role / disable   |

## AI mentor — Phase 6

| Method | Path                  | Auth | Notes                                                        |
| ------ | --------------------- | ---- | ----------------------------------------------------------- |
| POST   | `/api/mentor/ask` ⏱   | user | `{ challengeSlug, question }` length-bounded. Server-side proxy; **flag never in prompt**; never returns a flag/solution. |

## Realtime — Phase 5 (Pusher)

Not REST. Events published **after** the DB commit:

- Private, server-authorized channels (`private-user-:id`): `achievement.unlocked`, `rank.changed`.
- Public channel (`leaderboard`, `announcements`): `leaderboard.updated`, `challenge.published`, `announcement.posted`.
- Channel auth endpoint: `POST /api/pusher/auth` (`user`) — authorizes private subscriptions server-side.
