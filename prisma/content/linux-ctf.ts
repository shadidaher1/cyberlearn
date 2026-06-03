import type { SeedCourse } from './types'

/**
 * Linux CTF — the applied track. No new teaching: each challenge drops you into
 * a short scenario and asks you to reason with what the courses taught. Higher
 * points, no walkthrough. Classified as a CTF path in src/config/learning.ts.
 */
export const linuxCtf: SeedCourse = {
  categorySlug: 'linux',
  slug: 'linux-ctf',
  title: 'Linux CTF',
  summary:
    'Put the commands to work — permission maths, a SUID trap, log triage, a crontab, and a poisoned PATH.',
  difficulty: 'HARD',
  order: 3,
  challenges: [
    {
      slug: 'linux-ctf-locked-down',
      title: 'Locked Down',
      difficulty: 'MEDIUM',
      points: 150,
      description: `Your deploy script just refused to use an SSH key:

\`\`\`
Permissions 0644 for 'id_ed25519' are too open.
\`\`\`

SSH won't touch a private key that anyone but its owner can read. Lock it down so
the **owner may read and write it, and group and others get nothing at all** —
then give the exact argument you'd hand to \`chmod\`.

**Submit** that three-digit octal mode as \`flag{NNN}\`.`,
      flag: 'flag{600}',
      hints: [
        { content: 'Owner rw = 4 + 2. Group and others = 0.', cost: 0 },
        { content: 'Two of the three digits are 0.', cost: 15 },
      ],
    },
    {
      slug: 'linux-ctf-innocent-binary',
      title: 'The Innocent-Looking Binary',
      difficulty: 'HARD',
      points: 200,
      description: `Fresh on a box, you sweep for binaries running with borrowed privileges:

\`\`\`
$ find / -perm -4000 -type f 2>/dev/null
/usr/bin/passwd
/usr/bin/sudo
/opt/acme/report
\`\`\`

The first two are normal. The third is a **custom**, root-owned program with the
set-user-ID bit — and when you run it, your effective user becomes \`root\`. A
non-root user leveraging a misconfigured root binary to gain root is the textbook
example of one attack class.

**Submit** that two-word attack class as \`flag{two_words_snake_case}\`.`,
      flag: 'flag{privilege_escalation}',
      hints: [
        { content: 'Going from an ordinary account *up* to root.', cost: 0 },
        { content: 'privilege + escalation.', cost: 20 },
      ],
    },
    {
      slug: 'linux-ctf-counting-failures',
      title: 'Counting Failures',
      difficulty: 'MEDIUM',
      points: 150,
      description: `Here's a slice of \`/var/log/auth.log\`. Triage it the way you would on a real
box — filter for the noise that matters:

\`\`\`
Failed password for invalid user admin from 203.0.113.7 port 51020 ssh2
Accepted password for shadi from 10.0.0.4 port 4021 ssh2
Failed password for root from 203.0.113.7 port 51022 ssh2
Failed password for root from 198.51.100.9 port 33001 ssh2
Failed password for invalid user git from 203.0.113.7 port 51044 ssh2
Accepted publickey for deploy from 10.0.0.8 port 5210 ssh2
\`\`\`

One host is clearly spraying passwords. Count the **failed** login attempts that
originate from \`203.0.113.7\` — the number \`grep "Failed password" | grep
203.0.113.7 | wc -l\` would print.

**Submit** it as \`flag{N}\`.`,
      flag: 'flag{3}',
      hints: [
        {
          content: 'Only lines that are both a "Failed password" *and* from 203.0.113.7.',
          cost: 0,
        },
        { content: 'It is more than two and fewer than four.', cost: 15 },
      ],
    },
    {
      slug: 'linux-ctf-reading-the-schedule',
      title: 'Reading the Schedule',
      difficulty: 'MEDIUM',
      points: 150,
      description: `Auditing \`crontab -l\` on a server, you find a single job:

\`\`\`
# ┌ min  ┌ hour  ┌ day-of-month  ┌ month  ┌ day-of-week (0 = Sunday)
  30      3       *               *        0     /opt/acme/clean.sh
\`\`\`

Decode *when* it fires. The fifth field is the one that matters here.

**Submit** the day of the week this job runs, lower-case, as \`flag{day}\`.`,
      flag: 'flag{sunday}',
      hints: [
        {
          content: 'The fifth field is the day-of-week, and the legend tells you 0 = Sunday.',
          cost: 0,
        },
        { content: 'It runs once a week, at 03:30, on the weekend.', cost: 10 },
      ],
    },
    {
      slug: 'linux-ctf-poisoned-path',
      title: 'The Poisoned Path',
      difficulty: 'HARD',
      points: 200,
      description: `A root-owned cron job runs this every minute:

\`\`\`
* * * * * cd /var/spool/acme && tar -czf backup.tgz ./data
\`\`\`

It calls \`tar\` by **bare name**, not \`/bin/tar\`. You notice your own writable
directory sits at the front of root's search path:

\`\`\`
PATH=/home/you/bin:/usr/bin:/bin
\`\`\`

So you drop a malicious script named \`tar\` into \`/home/you/bin\`, and the next
time the job runs, *yours* executes as root instead of the real one. Name the
two-word attack (snake_case) where a binary planted earlier in the search path
hijacks a bare-name command.

**Submit** it as \`flag{two_words_snake_case}\`.`,
      flag: 'flag{path_hijacking}',
      hints: [
        {
          content: 'The vulnerability is the search variable you learned in Linux Advanced.',
          cost: 0,
        },
        { content: 'path + hijacking.', cost: 20 },
      ],
    },
  ],
}
