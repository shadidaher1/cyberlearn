# SCHEMA.md — CyberLearn data model

The Prisma data model and the reasoning behind it. **Phase 0 implements only
`User` + `Role`** (enough to connect to Neon and migrate); the rest below is the
**design** that Phase 2+ implements. Conventions: models `PascalCase`, tables
`@@map`'d to `snake_case` plural, ids are `cuid()`, money-of-the-app (points) are
plain `Int`.

## Entity overview

```
User ─┬─< Submission >─ Challenge ─┬─< Hint
      ├─< Solve ──────── Challenge  ├── Category
      ├─ Score (1:1)                └── LearningPath (ordered)
      ├─< UserAchievement >─ Achievement
      ├─< RefreshToken
      ├─< VerificationToken
      └─< OAuthAccount
Announcement, AuditLog (admin)
```

## Auth & identity

### User

| Field               | Type        | Notes                                  |
| ------------------- | ----------- | -------------------------------------- |
| id                  | String cuid | PK                                     |
| email               | String      | `@unique`, stored lower-cased          |
| username            | String      | `@unique`, public handle               |
| passwordHash        | String?     | argon2id; null for OAuth-only accounts |
| role                | Role        | `USER` \| `ADMIN`, default `USER`      |
| emailVerified       | DateTime?   | null until verified                    |
| avatarUrl           | String?     |                                        |
| bio                 | String?     |                                        |
| createdAt/updatedAt | DateTime    |                                        |

**Why `passwordHash` nullable:** GitHub-OAuth users may never set a password.
Login logic must branch on credential type.

### OAuthAccount

`(provider, providerAccountId)` `@@unique`; `userId` FK. Stores the GitHub linkage
(provider, providerAccountId, optional scopes). No access tokens persisted unless
needed; if stored, encrypted.

### RefreshToken (rotating)

| Field     | Notes                                                                |
| --------- | -------------------------------------------------------------------- |
| id        | PK                                                                   |
| userId    | FK, indexed                                                          |
| tokenHash | **SHA-256 of the raw token** — raw token only lives in the cookie    |
| familyId  | groups a rotation chain; reuse of a rotated token revokes the family |
| expiresAt | DateTime                                                             |
| revokedAt | DateTime?                                                            |
| createdAt | DateTime                                                             |

**Why hashed + family:** a leaked DB exposes no usable tokens; detecting reuse of
an already-rotated token signals theft → revoke the whole family.

### VerificationToken

`type: EMAIL_VERIFY | PASSWORD_RESET`, `tokenHash` (SHA-256), `expiresAt`,
`consumedAt` (single-use). Lookups by hash; never store the raw token.

## Learning content

### Category

`id`, `slug @unique`, `name`, `description`, `icon`, `order`, `createdAt`.
Launch set: Web Security, Cryptography, OSINT, Forensics, Reverse Engineering,
Linux, Networking. **Modeled as a table, not an enum**, so adding a category is a
row, not a migration.

### LearningPath

`id`, `slug @unique`, `title`, `summary`, `categoryId` FK, `difficulty`, `order`,
`published`. A curated, ordered track within a category.

### Path kind — COURSE vs CTF

The catalog (`/learn`) groups published paths by category and splits each into
**Courses** (taught lesson-by-lesson) and a secondary **CTF** section (applied,
flag-only). That distinction is **not** a DB column — it lives in
`src/config/learning.ts` (`pathKind(slug)`), because the local `.env` points at
the shared production database and the split is purely presentational. Promote it
to a `LearningPath.kind` enum if path management ever moves into the admin UI.

Path/challenge seed content lives in versioned modules under `prisma/content/*`
and is validated **without a database** by `tests/content.test.ts` (unique
kebab-case slugs, `flag{…}` format, hints, CTF classification). `prisma/seed.ts`
consumes that registry idempotently alongside the inline OWASP Top 10.

### Challenge

| Field                                | Type         | Notes                                                         |
| ------------------------------------ | ------------ | ------------------------------------------------------------- |
| id                                   | String cuid  | PK                                                            |
| slug                                 | String       | `@unique`                                                     |
| title                                | String       |                                                               |
| description                          | String       | markdown, original content (authored in admin)                |
| categoryId                           | FK           | indexed                                                       |
| pathId                               | FK?          | nullable; `orderInPath` Int? for sequence                     |
| difficulty                           | Difficulty   | `EASY \| MEDIUM \| HARD \| INSANE`                            |
| points                               | Int          | base award (see GAMIFICATION.md)                              |
| **flagHash**                         | String       | `HMAC-SHA256(normalize(flag), FLAG_PEPPER)` — never plaintext |
| flagCaseSensitive                    | Boolean      | normalisation toggle                                          |
| authorId                             | FK           | the admin who wrote it                                        |
| published                            | Boolean      | draft vs live                                                 |
| releasedAt                           | DateTime?    | scheduled release                                             |
| solveCount                           | Int          | denormalized, for fast listing                                |
| fileName/fileUrl/fileSize/fileSha256 | String?/Int? | downloadable artifact (RE/forensics)                          |
| createdAt/updatedAt                  | DateTime     |                                                               |

**Why `flagHash` here and the rationale for HMAC over argon2/plain-SHA:** see
`docs/SECURITY.md §3`. The flag is **never** selected into any API response —
handlers must `select` explicit fields and omit `flagHash`.

### Hint

`id`, `challengeId` FK, `order`, `content`, `cost` Int (points deducted on
unlock, may be 0). Per-user unlocks tracked by `HintUnlock(userId, hintId)`
`@@unique` so a hint is paid for once.

## Progress, scoring, achievements

### Submission (attempt log)

`id`, `userId` FK, `challengeId` FK, `correct` Boolean, `createdAt`.
Indexed `(userId, challengeId, createdAt)` for history + rate-limit windows.
**Raw flag attempts are not stored** (only the boolean outcome) to avoid
persisting near-flags.

### Solve (the award record — integrity anchor)

| Field        | Notes                                                        |
| ------------ | ------------------------------------------------------------ |
| id           | PK                                                           |
| userId       | FK                                                           |
| challengeId  | FK                                                           |
| points       | points actually awarded (after any hint penalty)             |
| isFirstBlood | Boolean                                                      |
| createdAt    | DateTime                                                     |
|              | **`@@unique([userId, challengeId])`** ← solve-once at the DB |

The unique constraint is the guarantee: a second correct submission hits it and
is handled as "already solved." Points are awarded **only** when a `Solve` row is
created, **inside the submission transaction**.

### Score (denormalized aggregate, 1:1 User)

`userId @unique`, `points` Int, `solves` Int, `lastSolveAt` DateTime.
Updated transactionally with each `Solve`. Index **`(points DESC, lastSolveAt ASC)`**
powers the leaderboard and its deterministic tie-break.

**Why denormalize:** the leaderboard is the hottest read; recomputing
`SUM(points)` per request doesn't scale. The trade-off is that `Score` must only
ever change inside the solve transaction.

### Achievement / UserAchievement

`Achievement`: `slug @unique`, `name`, `description`, `icon`,
`kind: FIRST_BLOOD | CATEGORY_MASTERY | MILESTONE | STREAK`, `criteria` Json.
`UserAchievement`: `userId`, `achievementId`, `challengeId?` (context),
`createdAt`, **`@@unique([userId, achievementId])`** ← award-once at the DB.

## Admin

- **Announcement** — `title`, `body`, `authorId`, `pinned`, `publishedAt`.
- **AuditLog** — `actorId`, `action`, `targetType`, `targetId`, `meta` Json,
  `createdAt`. Every admin mutation writes one; immutable, append-only.

## Enums

```prisma
enum Role             { USER ADMIN }
enum Difficulty       { EASY MEDIUM HARD INSANE }
enum VerificationKind { EMAIL_VERIFY PASSWORD_RESET }
enum AchievementKind  { FIRST_BLOOD CATEGORY_MASTERY MILESTONE STREAK }
```

## Indexing & integrity summary

- `@@unique`: `Solve(userId, challengeId)`, `UserAchievement(userId, achievementId)`,
  `HintUnlock(userId, hintId)`, `User.email`, `User.username`,
  `OAuthAccount(provider, providerAccountId)`, all `slug`s.
- Index: `Score(points, lastSolveAt)`, `Submission(userId, challengeId, createdAt)`,
  `Challenge.categoryId`, `Challenge.pathId`.
- FKs use `onDelete: Cascade` for owned children (a user's tokens/submissions),
  `Restrict` where deletion should be blocked (a category with challenges).

## Migration policy

Phase 0 = `User` + `Role` only. Each later phase adds models in its own migration
on its own branch. Never edit a shipped migration; add a new one. Migrate a
Neon dev/preview branch before production.
