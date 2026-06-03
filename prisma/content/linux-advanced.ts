import type { SeedCourse } from './types'

/**
 * Linux Advanced — the step up from Basics. Permissions maths, privilege bits,
 * scheduling, services, keys, stream editing, and how the shell finds a command.
 * Several lessons carry a security angle (SUID, PATH hijacking, SSH keys).
 */
export const linuxAdvanced: SeedCourse = {
  categorySlug: 'linux',
  slug: 'linux-advanced',
  title: 'Linux Advanced',
  summary:
    'Power-user and sysadmin ground: octal permissions, SUID, cron, systemd, SSH keys, sed, and the $PATH.',
  difficulty: 'HARD',
  order: 2,
  challenges: [
    {
      slug: 'linux-octal-permissions',
      title: 'Permissions by the Numbers',
      difficulty: 'MEDIUM',
      points: 100,
      description: `In *Linux Basics* you read \`rwxr-xr--\` as three groups of three. Now make them
**numbers**, because that's how you'll actually set them. Each permission has a
value — read \`4\`, write \`2\`, execute \`1\` — and you add them up per group:

\`\`\`
rwx = 4+2+1 = 7      r-x = 4+0+1 = 5      r-- = 4+0+0 = 4
chmod 750 deploy.sh  # owner rwx, group r-x, others nothing
\`\`\`

So one three-digit octal number encodes all nine bits. \`chmod 600 id_rsa\` is the
classic: owner read/write, **nobody else anything** — exactly what SSH demands of
a private key. Reason backwards and you can read any mode at a glance.

A config file should be readable and writable by its owner and only *readable*
by the group, with nothing for others — \`rw-r-----\`.

**Submit** that file's three-digit octal mode as \`flag{NNN}\`.`,
      flag: 'flag{640}',
      hints: [
        { content: 'Owner rw = 4+2 = 6. Group r = 4. Others = 0.', cost: 0 },
        { content: 'Three digits, and the last one is 0.', cost: 10 },
      ],
    },
    {
      slug: 'linux-suid',
      title: 'Borrowed Power',
      difficulty: 'HARD',
      points: 150,
      description: `Look closely at a long listing and you'll sometimes see an \`s\` where an \`x\`
should be in the owner's group:

\`\`\`
-rwsr-xr-x  1 root root  /usr/bin/passwd
\`\`\`

That \`s\` is the **set-user-ID** bit. When set, the program runs with the
privileges of the file's *owner* — not yours. \`passwd\` needs it for a good
reason: changing your password means writing to a root-owned file. But every
such binary is a loaded gun: if an attacker finds an unusual or custom program
with this bit set as root, abusing it is a textbook **privilege escalation**.
Hunting for them is a first move on any box:

\`\`\`
find / -perm -4000 -type f 2>/dev/null
\`\`\`

**Submit** the four-letter name of that owner-privilege bit (the \`s\` above) as
\`flag{name}\`.`,
      flag: 'flag{suid}',
      hints: [
        { content: 'Set-User-ID. The first two letters are "su" — as in switch user.', cost: 0 },
        { content: 'Four letters: s-u-i-d.', cost: 15 },
      ],
    },
    {
      slug: 'linux-ownership',
      title: 'Whose File Is It?',
      difficulty: 'MEDIUM',
      points: 100,
      description: `Permissions decide *what* the owner and group may do — but who *are* they? Every
file records an owning user and an owning group, and one command reassigns them:

\`\`\`
chown alice report.txt          # change the owner to alice
chown alice:devs report.txt     # owner alice, group devs
chown -R www-data:www-data /srv/app   # recurse through a whole tree
\`\`\`

This is the other half of the access story. A web server dropped into \`/srv\` is
useless if every file is owned by \`root\` and the \`www-data\` service can't read
them — the fix is ownership, not looser permissions. Handing a sensitive file to
the wrong owner is just as dangerous as a wide-open \`chmod\`.

**Submit** the command that changes a file's owner (and optionally its group) as
\`flag{command}\`.`,
      flag: 'flag{chown}',
      hints: [
        { content: 'Read it as "change owner".', cost: 0 },
        { content: 'ch + own.', cost: 10 },
      ],
    },
    {
      slug: 'linux-cron',
      title: 'Set It and Forget It',
      difficulty: 'MEDIUM',
      points: 100,
      description: `Some work shouldn't wait for a human: rotate the logs at midnight, back up the
database every hour, renew a certificate each week. A background scheduler runs
jobs on a clock, and you describe *when* with five time fields:

\`\`\`
# ┌ minute  ┌ hour  ┌ day-of-month  ┌ month  ┌ day-of-week
  0          2       *               *        *      /usr/local/bin/backup.sh
\`\`\`

That line means "02:00 every day." You edit your personal schedule with
\`crontab -e\` and list it with \`crontab -l\`. It's a favourite persistence trick,
too: defenders audit these tables because a malicious entry re-runs an attacker's
payload long after they've left.

**Submit** the four-letter name of the time-based job scheduler as \`flag{name}\`.`,
      flag: 'flag{cron}',
      hints: [
        {
          content: 'Your schedule lives in a table edited with `crontab -e`. Drop the "tab".',
          cost: 0,
        },
        { content: 'Four letters, from the Greek *chronos* (time).', cost: 10 },
      ],
    },
    {
      slug: 'linux-systemctl',
      title: 'The Service Manager',
      difficulty: 'MEDIUM',
      points: 100,
      description: `Long-running programs — a web server, a database, the SSH daemon — are managed
as **services** by the system's init. On modern distributions that init is
*systemd*, and you drive it with one front-end command:

\`\`\`
systemctl status nginx     # is it running? why did it die?
systemctl start  nginx     # start it now
systemctl enable nginx     # ...and start it automatically on every boot
\`\`\`

Note the difference between \`start\` (now, once) and \`enable\` (on boot, forever) —
mixing them up is why a service "keeps disappearing after a reboot." A unit file
under \`/etc/systemd/system\` declares how each service launches.

**Submit** the command used to start, stop, and inspect systemd services as
\`flag{command}\`.`,
      flag: 'flag{systemctl}',
      hints: [
        { content: 'systemd + "control", abbreviated.', cost: 0 },
        { content: 'system + ctl.', cost: 10 },
      ],
    },
    {
      slug: 'linux-ssh-keys',
      title: 'Keys to the Kingdom',
      difficulty: 'MEDIUM',
      points: 100,
      description: `Passwords over SSH are brute-forceable; key pairs are not. You generate a pair
once with \`ssh-keygen\`, and it gives you two halves:

\`\`\`
~/.ssh/id_ed25519       # the PRIVATE key — stays on your laptop, chmod 600
~/.ssh/id_ed25519.pub   # the PUBLIC key  — safe to hand out
\`\`\`

To log in to a server, you append your **public** half to that server's
\`~/.ssh/authorized_keys\`. The server then challenges you to prove you hold the
matching private half — which never leaves your machine and is never sent over
the wire. Lose the private key and it's game over; leak the public one and
nothing happens. That asymmetry is the whole point.

**Submit** the name of the half of the key pair that you copy onto the server as
\`flag{two_words_snake_case}\`.`,
      flag: 'flag{public_key}',
      hints: [
        { content: 'The half ending in `.pub`, the one that is safe to share.', cost: 0 },
        { content: 'public + key.', cost: 10 },
      ],
    },
    {
      slug: 'linux-sed',
      title: 'Stream Surgery',
      difficulty: 'MEDIUM',
      points: 100,
      description: `Sometimes you need to *change* text as it streams past — rewrite a config value
across a hundred files without opening an editor. The **stream editor** applies
an edit script to its input line by line:

\`\`\`
sed 's/DEBUG/INFO/' app.log          # substitute the first DEBUG on each line
sed -i 's|/old/path|/new/path|g' *.conf   # edit files in place, every match
\`\`\`

Its signature is the \`s/old/new/\` substitution — read it as "**s**ubstitute old
with new." Add \`g\` for every match on a line, \`-i\` to write changes back to the
file. Its companion \`awk\` is the field specialist (\`awk '{ print $1 }'\` prints
the first column), but for surgical find-and-replace, this is the scalpel.

**Submit** the three-letter name of the stream editor as \`flag{name}\`.`,
      flag: 'flag{sed}',
      hints: [
        { content: 'Stream EDitor. Its trademark is `s/old/new/`.', cost: 0 },
        { content: 'Three letters: s-e-d.', cost: 10 },
      ],
    },
    {
      slug: 'linux-path-variable',
      title: 'How the Shell Finds a Command',
      difficulty: 'HARD',
      points: 150,
      description: `When you type \`ls\`, how does the shell know it means \`/usr/bin/ls\`? It consults
an environment variable: a colon-separated list of directories it searches, left
to right, stopping at the first match:

\`\`\`
echo $PATH
/usr/local/bin:/usr/bin:/bin:/usr/sbin
which ls        # → /usr/bin/ls  (where the search landed)
\`\`\`

This is also a classic attack. If a privileged script calls \`tar\` by bare name
and a directory you control sits *earlier* in the list, your malicious \`tar\` runs
instead — a **PATH hijack**. That's why hardened scripts call binaries by their
full path, and why \`.\` should never appear in this variable.

**Submit** the name of the environment variable that lists where the shell looks
for commands as \`flag{name}\`.`,
      flag: 'flag{path}',
      hints: [
        {
          content: 'You printed it above with `echo $____`. It is upper-case in the shell.',
          cost: 0,
        },
        { content: 'Four letters: p-a-t-h.', cost: 15 },
      ],
    },
  ],
}
