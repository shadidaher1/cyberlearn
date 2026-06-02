# GAMIFICATION.md — scoring, ranks, achievements, fairness

How points, ranks, the leaderboard, and achievements work — and the
atomicity/fairness rules that keep them honest. Implemented in Phase 3
(`feat/gamification`); constants live in `src/config/gamification.ts`.

## Points

Each challenge has a base award by difficulty (admin may override per challenge):

| Difficulty | Base points |
| ---------- | ----------- |
| EASY       | 50          |
| MEDIUM     | 100         |
| HARD       | 250         |
| INSANE     | 500         |

- **Awarded once** per `(user, challenge)` — enforced by `Solve(userId, challengeId)`
  `@@unique`. A re-submit after solving changes nothing.
- **Hint penalty:** unlocking a hint deducts its `cost` from the points that
  challenge will award (floored at a configurable minimum, e.g. 10). The penalty
  is applied to `Solve.points` at solve time so it's recorded, not recomputed.
- **First-blood bonus:** the first solver of a challenge gets a flat bonus (e.g.
  +25% of base, rounded) recorded on that `Solve`.
- **Authors don't score their own challenges.** A `Solve` by the challenge's
  `authorId` (or any `ADMIN` acting as author) awards 0 and is excluded from the
  leaderboard — no self-dealing.

## The solve transaction (the fairness core)

A correct submission runs as **one transaction**; either all of it commits or none:

```
BEGIN
  1. re-check the flag (constant-time) inside the txn
  2. INSERT Solve (userId, challengeId, points, isFirstBlood)
        └─ unique(userId, challengeId) → if it violates, the user already
           solved it: roll back, return { correct: true, awardedPoints: 0 }
  3. compute isFirstBlood atomically (see below)
  4. UPDATE Score: points += awarded, solves += 1, lastSolveAt = now()
        (upsert the row on first solve)
  5. evaluate + INSERT any UserAchievement (unique(userId, achievementId))
COMMIT
→ (Phase 5) publish realtime events AFTER commit
```

**Why a transaction + DB constraints, not application checks:** a read-then-write
("have they solved it? no → award") races under concurrent requests and can
double-award. Letting the **unique constraint** arbitrate makes the outcome
correct even when two correct submissions land at the same instant.

### Concurrency guarantee (tested)

The test fires **two simultaneous correct submissions** for the same challenge and
asserts: exactly one `Solve` row, points added exactly once, `Score` consistent.
The second submission catches the unique-violation and returns "already solved."

### First blood, atomically

`isFirstBlood` must not be decided by a racy `COUNT(*)`. Options used:
- Acquire a per-challenge advisory lock (or `SELECT … FOR UPDATE` on a challenge
  row) at the top of the txn, then `isFirstBlood = (existing Solve count == 0)`; or
- A partial unique index allowing exactly one `isFirstBlood = true` per challenge,
  so a second claimant fails the index and is recorded as a normal solve.

Either way the decision is serialized inside the transaction.

## Ranks & levels

**Level** is derived from cumulative points (never stored authoritative; computed):

| Rank          | Points ≥ |
| ------------- | -------- |
| Script Kiddie | 0        |
| Initiate      | 250      |
| Operator      | 750      |
| Breaker       | 1,750    |
| Specialist    | 3,500    |
| Elite         | 7,000    |
| Phantom       | 12,000   |

(Thresholds are config; tune with real data.) The UI shows current rank + progress
to the next threshold.

## Leaderboard

Ordered deterministically:

```sql
ORDER BY points DESC, lastSolveAt ASC, userId ASC
```

- **Deterministic tie-break:** equal points → whoever **reached** that total
  earlier (`lastSolveAt ASC`) ranks higher; `userId` is the final stable
  tie-break so paging never reshuffles equal rows.
- Backed by the `Score(points DESC, lastSolveAt ASC)` index; paginated.
- Admins/authors excluded. (Phase 5) updates pushed after commit, not polled.

## Progress & completion

- Per path/category: `solvedCount / totalPublished` → completion %.
- A path is "complete" at 100% of its published challenges; completion can itself
  grant a `CATEGORY_MASTERY` achievement.

## Achievements (award-once)

| Achievement       | Kind             | Criteria (example)                                  |
| ----------------- | ---------------- | --------------------------------------------------- |
| First Blood       | FIRST_BLOOD      | first solver of any challenge (per-challenge glyph) |
| Category Master   | CATEGORY_MASTERY | 100% of a category's published challenges           |
| Centurion         | MILESTONE        | 1,000 cumulative points                             |
| Streak            | STREAK           | solves on N consecutive days                        |

- Every award is one `UserAchievement` row, guarded by `@@unique([userId, achievementId])`
  — re-evaluation can't double-grant.
- Evaluated **inside the solve transaction** (for solve-derived achievements) so
  the unlock is atomic with the solve that earned it.

## Anti-abuse

- Per-user + per-challenge **rate limiting** on submission (Upstash) blunts
  brute-forcing flags.
- Attempt outcomes are logged (`Submission`), raw attempts are not.
- No points for self-authored challenges; admins excluded from ranking.
