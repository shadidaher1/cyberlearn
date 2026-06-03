import type { SeedCourse } from './types'

/**
 * Linux Basics — a taught course. Each lesson teaches one core command or
 * concept and ends in a recall flag (the same shape as the OWASP set: read,
 * then capture). No live shell is required; these build command fluency.
 */
export const linuxBasics: SeedCourse = {
  categorySlug: 'linux',
  slug: 'linux-basics',
  title: 'Linux Basics',
  summary:
    'Find your way around the shell — navigate, read files, search, and read permissions, one command at a time.',
  difficulty: 'EASY',
  order: 1,
  challenges: [
    {
      slug: 'linux-the-manual',
      title: 'Ask the Manual',
      difficulty: 'EASY',
      points: 50,
      description: `Every command-line tool on a Unix system ships with its own instruction
booklet, and learning to read it is the most useful habit you can build. Stuck
on a command? Don't reach for a search engine first — ask the system itself.

\`\`\`
man ls
\`\`\`

This opens the **manual page** for \`ls\`: its synopsis, every flag, and usually a
few examples. Scroll with the arrow keys, search with \`/pattern\`, and quit with
\`q\`. When you only need a quick reminder, most tools also answer \`ls --help\`.

The manuals are split into numbered sections — commands, system calls, file
formats — so \`man 5 passwd\` documents the *file* while \`man passwd\` documents
the *command*.

**Submit** the three-letter command that opens a manual page as \`flag{command}\`.`,
      flag: 'flag{man}',
      hints: [
        { content: "It's short for 'manual'. You ran it in the example above.", cost: 0 },
        { content: 'Three letters: m-a-n.', cost: 5 },
      ],
    },
    {
      slug: 'linux-working-directory',
      title: 'You Are Here',
      difficulty: 'EASY',
      points: 50,
      description: `A Linux filesystem is a single tree that starts at the **root**, \`/\`, and
branches into directories. At any moment your shell sits *somewhere* in that
tree — your **working directory** — and most commands act relative to it.

\`\`\`
pwd            # print working directory  →  /home/shadi
cd /var/log    # jump to an absolute path
cd ..          # move up one level, to the parent
cd ~           # go home (shorthand for /home/you)
\`\`\`

A path beginning with \`/\` is **absolute** — measured from the root. Anything
else is **relative** to where you stand, where \`.\` means "here" and \`..\` means
"the directory above." Whenever you feel lost, one command always answers the
question "where am I?".

**Submit** that command — the one that prints your current location — as
\`flag{command}\`.`,
      flag: 'flag{pwd}',
      hints: [
        { content: 'Print Working Directory.', cost: 0 },
        { content: 'Three letters: p-w-d.', cost: 5 },
      ],
    },
    {
      slug: 'linux-hidden-files',
      title: 'Hidden in Plain Sight',
      difficulty: 'EASY',
      points: 50,
      description: `The first thing you do in an unfamiliar directory is look around:

\`\`\`
ls            # names only
ls -l         # long form: permissions, owner, size, date
ls -lh        # ...with human-readable sizes (4.0K, not 4096)
ls -a         # include the hidden entries
\`\`\`

Notice \`-a\`. By a long-standing convention, any file whose name begins with a
dot — \`.bashrc\`, \`.ssh\`, \`.env\` — is left out of a normal listing. Nothing is
encrypted or locked; the leading dot is just a quiet agreement to keep config
clutter out of sight. It's also the first place an auditor (or an attacker)
looks, because that's where secrets like \`.env\` and \`.ssh/id_rsa\` tend to hide.

**Submit** the name for a file whose name begins with a dot — hidden from a
normal \`ls\` — as \`flag{one_word}\`.`,
      flag: 'flag{dotfile}',
      hints: [
        { content: '`ls -a` reveals them; the name comes from the leading dot.', cost: 0 },
        { content: 'dot + file, written as one word.', cost: 5 },
      ],
    },
    {
      slug: 'linux-read-files',
      title: 'Cat and Mouse',
      difficulty: 'EASY',
      points: 50,
      description: `You found a file — now read it. The workhorse prints a file straight to your
terminal:

\`\`\`
cat notes.txt              # dump the whole file
cat part1.txt part2.txt    # con-cat-enate several, in order
\`\`\`

The command is named for **concatenation**, but day to day it just means "show
me this file." For anything longer than a screenful, page through it with
\`less\` (arrows to scroll, \`q\` to quit). When you only care about the edges,
\`head -n 20\` shows the first twenty lines and \`tail -n 20\` the last — and the
much-loved \`tail -f\` *follows* a log file live as new lines arrive.

**Submit** the three-letter command, named after concatenation, that prints a
file to the screen as \`flag{command}\`.`,
      flag: 'flag{cat}',
      hints: [
        { content: "Three letters, named for 'concatenate'.", cost: 0 },
        { content: 'It says "meow".', cost: 5 },
      ],
    },
    {
      slug: 'linux-find-files',
      title: 'Needle in the Filesystem',
      difficulty: 'EASY',
      points: 50,
      description: `Somewhere under your home directory is a file you need, but you can't remember
where you left it. Don't dig by hand — search:

\`\`\`
find . -name "*.pem"               # every .pem under the current dir
find /etc -type f -name "*.conf"   # config files under /etc
find . -mtime -1                   # anything changed in the last 24h
\`\`\`

\`find\` walks an entire directory tree from a starting point and tests every
entry against your filters — by name, type, size, age, even permissions. It's
the first tool a defender reaches for to hunt down stray private keys, and the
first an attacker uses to locate world-writable files worth tampering with.

**Submit** the four-letter command that recursively searches the filesystem for
files as \`flag{command}\`.`,
      flag: 'flag{find}',
      hints: [
        { content: 'It does exactly what its plain English name says.', cost: 0 },
        { content: 'Four letters: f-i-n-d.', cost: 5 },
      ],
    },
    {
      slug: 'linux-search-text',
      title: 'Needle in the Logfile',
      difficulty: 'EASY',
      points: 50,
      description: `A server's auth log is 40,000 lines long, and somewhere inside it is the one
failed-login entry you care about. Scrolling is hopeless — you need to *filter*.

\`\`\`
cat /var/log/auth.log | ____ "Failed password"
\`\`\`

This command reads input line by line and prints only the lines matching a
pattern (a regular expression). Pipe anything into it and it becomes a sieve for
text: \`-i\` ignores case, \`-r\` recurses a directory, \`-c\` counts matches, and
\`-v\` *inverts* the match to show the lines that **don't** match. It's the most
reached-for filter on the command line, named after an old text-editor
incantation — \`g/re/p\`, *globally search a regular expression and print*.

**Submit** the name of the command that fills the blank above as \`flag{command}\`.`,
      flag: 'flag{grep}',
      hints: [
        {
          content: 'You pipe text into it to keep only matching lines; its name comes from g/re/p.',
          cost: 0,
        },
        { content: 'Four letters, starts with g.', cost: 5 },
      ],
    },
    {
      slug: 'linux-pipes-redirection',
      title: 'Plumbing',
      difficulty: 'EASY',
      points: 75,
      description: `The Unix philosophy is small tools, each doing one thing well, **composed**
into pipelines. One operator wires the output of one command straight into the
input of the next:

\`\`\`
ps aux | grep ssh | wc -l    # how many ssh processes are running?
\`\`\`

No temporary files, no copy-paste — just a stream flowing left to right through
each stage. Its close cousins **redirect** that stream to and from files instead
of the screen: \`>\` writes a file (overwriting it), \`>>\` appends to it, and \`<\`
feeds a file in as input. Master these few characters and you can assemble almost
any task out of parts you already know.

**Submit** the name of the \`|\` operator that connects one command's output to
the next command's input as \`flag{one_word}\`.`,
      flag: 'flag{pipe}',
      hints: [
        {
          content: 'Think plumbing — the `|` character carries a stream between commands.',
          cost: 0,
        },
        { content: 'Four letters: p-i-p-e.', cost: 10 },
      ],
    },
    {
      slug: 'linux-read-permissions',
      title: 'Read, Write, Run',
      difficulty: 'EASY',
      points: 75,
      description: `Run \`ls -l\` and every entry shows a ten-character cipher on the left:

\`\`\`
-rwxr-xr--  1  shadi  staff  1.2K  deploy.sh
\`\`\`

Ignore the first character (it marks the file *type*). The next nine are **three
groups of three** — for the **owner**, the **group**, and **everyone else** —
and each group grants *read* (\`r\`), *write* (\`w\`), or execute (\`x\`). So
\`rwxr-xr--\` means the owner can do everything, the group can read and run, and
others may only read. That last permission is the one that turns an ordinary
file into something the system will actually *run* as a program — get it wrong
and your script "isn't found"; grant it carelessly and you've armed a payload.

**Submit** the full word for what the \`x\` bit grants as \`flag{one_word}\`.`,
      flag: 'flag{execute}',
      hints: [
        { content: 'r = read, w = write, x = ___.', cost: 0 },
        { content: "It's what you do to a program to make it run.", cost: 10 },
      ],
    },
  ],
}
