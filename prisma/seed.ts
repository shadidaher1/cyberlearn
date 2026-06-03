/**
 * Idempotent seed — safe to re-run (everything upserts on a natural key).
 *
 * Seeds the launch categories, a controlled admin author, the OWASP Top 10
 * learning path, ten original challenges (one per OWASP category), and the
 * achievement catalogue.
 *
 * All lesson content here is original. Flags are stored as
 * HMAC-SHA256(trim(flag), FLAG_PEPPER) — never plaintext.
 *
 * Run with:  node --env-file=.env --import tsx prisma/seed.ts
 */
import { hash as argon2hash } from '@node-rs/argon2'
import { PrismaClient, type Difficulty } from '@prisma/client'
import { createHmac } from 'node:crypto'

import { CATEGORIES, COURSES } from './content'

const prisma = new PrismaClient()

const FLAG_PEPPER = process.env.FLAG_PEPPER
if (!FLAG_PEPPER) {
  throw new Error('FLAG_PEPPER is required to seed flag hashes. Set it in .env.')
}

function hashFlag(flag: string): string {
  return createHmac('sha256', FLAG_PEPPER!).update(flag.trim()).digest('hex')
}

interface SeedChallenge {
  slug: string
  title: string
  owaspRef: string
  difficulty: Difficulty
  points: number
  description: string
  flag: string
  hints: { content: string; cost: number }[]
}

const OWASP: SeedChallenge[] = [
  {
    slug: 'web-a01-broken-access-control',
    title: 'The Invoice Next Door',
    owaspRef: 'A01:2021 — Broken Access Control',
    difficulty: 'EASY',
    points: 50,
    description: `**Broken Access Control** is the most common web weakness: the app
authenticates *who* you are but fails to enforce *what* you're allowed to do.

You're logged into a billing portal. Your latest invoice loads at:

\`\`\`
GET /api/v1/invoices/7700
\`\`\`

Out of curiosity you request \`7701\` — and another company's invoice loads. The
server checked that you were *logged in*, but never checked that invoice 7701
*belonged to you*. This pattern (swapping an identifier to reach someone else's
object) is an **IDOR**.

The robust fix isn't to hide or randomise the id — it's a mindset: every object
access starts from **refuse**, and is only allowed once an explicit ownership /
role check passes. Name that principle.

**Submit** the principle as \`flag{two_words_snake_case}\` — the rule that access
should be refused unless explicitly granted.`,
    flag: 'flag{deny_by_default}',
    hints: [
      { content: 'The opposite of "allow unless forbidden". Start from a closed door.', cost: 0 },
      { content: 'deny … by … (what you fall back to when no rule grants access).', cost: 5 },
    ],
  },
  {
    slug: 'web-a02-cryptographic-failures',
    title: 'Hashed, Not Hidden',
    owaspRef: 'A02:2021 — Cryptographic Failures',
    difficulty: 'MEDIUM',
    points: 100,
    description: `**Cryptographic Failures** are about data that should have been
protected and wasn't — plaintext passwords, secrets in source, TLS turned off,
or password "hashing" with a fast algorithm like MD5 or a single round of SHA-256.

Fast hashes are the trap. A GPU can try billions of MD5/SHA guesses per second,
so a stolen password table falls quickly. The defence is a **slow, salted,
memory-hard** password hash designed to make each guess expensive — the kind
this very platform uses for its own user passwords.

**Submit** the name of that algorithm (the memory-hard winner of the Password
Hashing Competition, the variant resistant to both GPU and side-channel attacks)
as \`flag{algorithm_name}\`.`,
    flag: 'flag{argon2id}',
    hints: [
      {
        content: "It's what CyberLearn hashes your password with — check docs/SECURITY.md.",
        cost: 0,
      },
      { content: 'argon2 has three variants: d, i, and the hybrid …', cost: 10 },
    ],
  },
  {
    slug: 'web-a03-injection',
    title: 'Quotes and Consequences',
    owaspRef: 'A03:2021 — Injection',
    difficulty: 'MEDIUM',
    points: 100,
    description: `**Injection** happens when untrusted input is glued into an
interpreter — SQL, shell, LDAP — as *code* rather than *data*. Classic SQL
injection:

\`\`\`js
db.query("SELECT * FROM users WHERE name = '" + input + "'")
\`\`\`

Submit \`' OR '1'='1\` and the WHERE clause becomes always-true. Escaping quotes
by hand is a losing game; the real fix removes the ambiguity entirely by sending
the query and the data on **separate channels**, so input can never be parsed as
SQL. Prisma, prepared statements, and bound parameters all do this.

**Submit** the name of that technique — the two-word fix that binds inputs as
data instead of concatenating them — as \`flag{two_words_snake_case}\`.`,
    flag: 'flag{parameterized_queries}',
    hints: [
      { content: 'Also called "prepared statements" or "bound parameters".', cost: 0 },
      {
        content: 'parameter… + queries (the query carries placeholders, data fills them).',
        cost: 10,
      },
    ],
  },
  {
    slug: 'web-a04-insecure-design',
    title: 'The Flaw Before the Code',
    owaspRef: 'A04:2021 — Insecure Design',
    difficulty: 'HARD',
    points: 250,
    description: `**Insecure Design** is a category about flaws you can't patch your
way out of, because they live in the *design*, not the implementation. A perfectly
coded "reset password by answering your mother's maiden name" feature is still
insecure by design.

Example: a money-transfer feature with no limit and no step-up verification is
not a bug in a function — it's a missing control in the design. You can't unit-test
your way to safety; you have to anticipate how an attacker would abuse each
feature *before* building it, and design the controls in.

The discipline of systematically asking "what could go wrong here, who would
attack it, and how do we mitigate it?" — done at design time — has a name.

**Submit** it as \`flag{two_words_snake_case}\`.`,
    flag: 'flag{threat_modeling}',
    hints: [
      {
        content: 'A structured exercise done on a whiteboard before coding. STRIDE is one method.',
        cost: 0,
      },
      { content: 'threat + …', cost: 20 },
    ],
  },
  {
    slug: 'web-a05-security-misconfiguration',
    title: 'Out of the Box, Into the Breach',
    owaspRef: 'A05:2021 — Security Misconfiguration',
    difficulty: 'EASY',
    points: 50,
    description: `**Security Misconfiguration** is the gap between "it works" and
"it's hardened": default admin passwords left unchanged, verbose stack traces
shown to users, directory listing enabled, an S3 bucket set to public, debug mode
on in production, missing security headers.

None of these are code bugs — they're settings. A framework that ships permissive
and asks you to lock it down will be deployed insecure by thousands of teams who
never get to it. The antidote is to ship and deploy with the *safe* option already
selected, so doing nothing leaves you protected rather than exposed.

**Submit** the two-word principle — configurations should be safe out of the box —
as \`flag{two_words_snake_case}\`.`,
    flag: 'flag{secure_defaults}',
    hints: [
      { content: "The safe choice should be the one you get when you don't choose.", cost: 0 },
      { content: 'secure + …', cost: 5 },
    ],
  },
  {
    slug: 'web-a06-vulnerable-components',
    title: 'You Are What You Import',
    owaspRef: 'A06:2021 — Vulnerable and Outdated Components',
    difficulty: 'MEDIUM',
    points: 100,
    description: `Modern apps are mostly other people's code. **Vulnerable and
Outdated Components** is the risk that one of your hundreds of transitive
dependencies has a known CVE — and you don't even know you're shipping it.
Log4Shell and the event-stream incident are famous examples.

You can't patch what you can't see. The foundational control is an accurate,
machine-readable inventory of every component and version in your build — so when
a new CVE drops, you can answer "are we affected?" in minutes instead of weeks.
That inventory has a standard name and a common three-letter acronym.

**Submit** the acronym (lowercase) as \`flag{acronym}\`.`,
    flag: 'flag{sbom}',
    hints: [
      { content: 'Software Bill of Materials.', cost: 0 },
      { content: 'Three letters: s-b-o-m.', cost: 10 },
    ],
  },
  {
    slug: 'web-a07-auth-failures',
    title: 'Something You Have',
    owaspRef: 'A07:2021 — Identification and Authentication Failures',
    difficulty: 'MEDIUM',
    points: 100,
    description: `**Identification and Authentication Failures** cover weak login
systems: permitting "password123", no lockout against brute force, session ids
that don't rotate, credential stuffing using last year's breach dumps.

Strong password hashing and rate-limiting help, but credentials alone are a single
point of failure — if the password leaks, the account is gone. The control that
breaks that single point of failure requires the attacker to also possess a second,
independent factor (a phone, a hardware key, a TOTP code): *something you have* on
top of *something you know*.

**Submit** the common three-letter acronym for that control (lowercase) as
\`flag{acronym}\`.`,
    flag: 'flag{mfa}',
    hints: [
      { content: 'Multi-Factor Authentication (2FA is the two-factor case).', cost: 0 },
      { content: 'Three letters: m-f-a.', cost: 10 },
    ],
  },
  {
    slug: 'web-a08-integrity-failures',
    title: 'Trust, but Verify',
    owaspRef: 'A08:2021 — Software and Data Integrity Failures',
    difficulty: 'HARD',
    points: 250,
    description: `**Software and Data Integrity Failures** are about trusting code or
data you never verified. A CI pipeline that pulls an unpinned dependency, an
auto-updater that installs an unsigned binary, an app that deserialises attacker-
controlled objects — each lets an attacker substitute *their* code for *yours*. The
SolarWinds supply-chain attack lived here.

The defence is to never run an artifact you can't cryptographically prove came from
who you think and wasn't tampered with — pin hashes, and check digital signatures
before executing updates or dependencies.

**Submit** the two-word control — cryptographically check the publisher's signature
before trusting an artifact — as \`flag{two_words_snake_case}\`.`,
    flag: 'flag{verify_signatures}',
    hints: [
      {
        content: 'A signed artifact proves origin + integrity — but only if you check it.',
        cost: 0,
      },
      { content: 'verify + … (the cryptographic proof attached by the publisher).', cost: 20 },
    ],
  },
  {
    slug: 'web-a09-logging-failures',
    title: 'The Breach No One Saw',
    owaspRef: 'A09:2021 — Security Logging and Monitoring Failures',
    difficulty: 'EASY',
    points: 50,
    description: `The average breach goes undetected for *months*. **Security Logging
and Monitoring Failures** is the risk that when an attacker probes your login,
escalates privileges, or exfiltrates data, nothing records it — so no alert fires
and no one can reconstruct what happened afterwards.

The baseline control is an append-only, tamper-resistant record of security-relevant
events — who did what, to what, and when — for both real-time alerting and after-the-
fact forensics. CyberLearn's own admin actions are designed to write exactly this.

**Submit** the two-word name for that record (the trail of security events) as
\`flag{two_words_snake_case}\`.`,
    flag: 'flag{audit_logging}',
    hints: [
      {
        content:
          'An immutable trail of "who did what when" — see the AuditLog model in docs/SCHEMA.md.',
        cost: 0,
      },
      { content: 'audit + … (also called an "audit trail").', cost: 5 },
    ],
  },
  {
    slug: 'web-a10-ssrf',
    title: 'The Server Makes a Call',
    owaspRef: 'A10:2021 — Server-Side Request Forgery (SSRF)',
    difficulty: 'HARD',
    points: 250,
    description: `**SSRF** tricks *your server* into making a request *it* chooses. A
"fetch image from URL" or "import from webhook" feature that accepts a URL and
fetches it can be pointed inward:

\`\`\`
http://169.254.169.254/latest/meta-data/   # cloud metadata — credentials!
http://localhost:6379/                      # internal Redis
\`\`\`

Because the request originates from the trusted server, it sails past the network
perimeter. Blocklists of "bad" hosts always miss something (DNS rebinding, redirects,
odd IP encodings). The durable fix inverts the logic: permit only an explicitly
approved set of destinations and reject everything else.

**Submit** the one-word name for that approved-only list (the opposite of a
blocklist) as \`flag{one_word}\`.`,
    flag: 'flag{allowlist}',
    hints: [
      {
        content: 'The opposite of a blocklist/denylist — default deny, permit the known-good.',
        cost: 0,
      },
      { content: 'allow + list (one word).', cost: 20 },
    ],
  },
]

const ACHIEVEMENTS = [
  {
    slug: 'first-blood',
    name: 'First Blood',
    description: 'Be the first to solve a challenge.',
    icon: 'droplet',
    kind: 'FIRST_BLOOD' as const,
  },
  {
    slug: 'getting-started',
    name: 'Getting Started',
    description: 'Solve your first challenge.',
    icon: 'flag',
    kind: 'MILESTONE' as const,
  },
  {
    slug: 'centurion',
    name: 'Centurion',
    description: 'Earn 100 points.',
    icon: 'shield',
    kind: 'MILESTONE' as const,
  },
  {
    slug: 'owasp-master',
    name: 'OWASP Master',
    description: 'Solve every challenge in the OWASP Top 10 path.',
    icon: 'crown',
    kind: 'CATEGORY_MASTERY' as const,
  },
]

async function main() {
  console.log('[seed] starting…')

  // ── Controlled admin author ──
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@cyberlearn.dev'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'CyberLearnAdmin!2026'
  const passwordHash = await argon2hash(adminPassword)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN' },
    create: {
      email: adminEmail,
      username: 'admin',
      role: 'ADMIN',
      passwordHash,
      emailVerified: new Date(),
    },
  })
  console.log(`[seed] admin: ${adminEmail}`)

  // ── Categories ──
  const categories = CATEGORIES
  const catBySlug = new Map<string, string>()
  for (const c of categories) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c })
    catBySlug.set(c.slug, row.id)
  }
  console.log(`[seed] categories: ${categories.length}`)

  // ── OWASP Top 10 learning path (Web Security) ──
  const path = await prisma.learningPath.upsert({
    where: { slug: 'owasp-top-10' },
    update: {
      title: 'OWASP Top 10',
      summary:
        'The ten most critical web application security risks — learn each by capturing its flag.',
      categoryId: catBySlug.get('web')!,
      difficulty: 'MEDIUM',
      order: 1,
      published: true,
    },
    create: {
      slug: 'owasp-top-10',
      title: 'OWASP Top 10',
      summary:
        'The ten most critical web application security risks — learn each by capturing its flag.',
      categoryId: catBySlug.get('web')!,
      difficulty: 'MEDIUM',
      order: 1,
      published: true,
    },
  })

  // ── Challenges ──
  let order = 1
  for (const ch of OWASP) {
    const common = {
      title: ch.title,
      description: ch.description,
      owaspRef: ch.owaspRef,
      categoryId: catBySlug.get('web')!,
      pathId: path.id,
      orderInPath: order,
      difficulty: ch.difficulty,
      points: ch.points,
      flagHash: hashFlag(ch.flag),
      authorId: admin.id,
      published: true,
      releasedAt: new Date(),
    }
    const challenge = await prisma.challenge.upsert({
      where: { slug: ch.slug },
      update: common,
      create: { slug: ch.slug, ...common },
    })

    // Hints: replace wholesale to stay idempotent.
    await prisma.hint.deleteMany({ where: { challengeId: challenge.id } })
    await prisma.hint.createMany({
      data: ch.hints.map((h, i) => ({
        challengeId: challenge.id,
        order: i + 1,
        content: h.content,
        cost: h.cost,
      })),
    })
    order += 1
  }
  console.log(`[seed] challenges: ${OWASP.length} (OWASP Top 10)`)

  // ── Additional courses (Linux, OSINT, …), driven by the content registry ──
  for (const course of COURSES) {
    const categoryId = catBySlug.get(course.categorySlug)
    if (!categoryId) {
      throw new Error(`[seed] unknown category for ${course.slug}: ${course.categorySlug}`)
    }

    const coursePath = await prisma.learningPath.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        summary: course.summary,
        categoryId,
        difficulty: course.difficulty,
        order: course.order,
        published: true,
      },
      create: {
        slug: course.slug,
        title: course.title,
        summary: course.summary,
        categoryId,
        difficulty: course.difficulty,
        order: course.order,
        published: true,
      },
    })

    let courseOrder = 1
    for (const ch of course.challenges) {
      const common = {
        title: ch.title,
        description: ch.description,
        owaspRef: ch.owaspRef ?? null,
        categoryId,
        pathId: coursePath.id,
        orderInPath: courseOrder,
        difficulty: ch.difficulty,
        points: ch.points,
        flagHash: hashFlag(ch.flag),
        authorId: admin.id,
        published: true,
        releasedAt: new Date(),
      }
      const challenge = await prisma.challenge.upsert({
        where: { slug: ch.slug },
        update: common,
        create: { slug: ch.slug, ...common },
      })

      await prisma.hint.deleteMany({ where: { challengeId: challenge.id } })
      if (ch.hints.length > 0) {
        await prisma.hint.createMany({
          data: ch.hints.map((h, i) => ({
            challengeId: challenge.id,
            order: i + 1,
            content: h.content,
            cost: h.cost,
          })),
        })
      }
      courseOrder += 1
    }
    console.log(`[seed] course: ${course.slug} (${course.challenges.length} challenges)`)
  }

  // ── Achievements ──
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({ where: { slug: a.slug }, update: a, create: a })
  }
  console.log(`[seed] achievements: ${ACHIEVEMENTS.length}`)

  console.log('[seed] done ✓')
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
