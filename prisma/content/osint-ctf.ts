import type { SeedCourse } from './types'

/**
 * OSINT CTF — the applied track, and the most hands-on set on the platform:
 * because OSINT's "lab" is the public internet, every flag here is a real,
 * verifiable fact you can confirm with a lookup. Answers are stable by design
 * (landmarks, historical registration dates, well-known breaches).
 * Classified as a CTF path in src/config/learning.ts.
 */
export const osintCtf: SeedCourse = {
  categorySlug: 'osint',
  slug: 'osint-ctf',
  title: 'OSINT CTF',
  summary:
    'Real investigations against public data: geolocate a photo, read a WHOIS record, an SPF record, a certificate log, and a breach.',
  difficulty: 'HARD',
  order: 2,
  challenges: [
    {
      slug: 'osint-ctf-dropped-pin',
      title: 'Dropped Pin',
      difficulty: 'MEDIUM',
      points: 150,
      description: `A photo lands on your desk with its EXIF intact. You strip out the GPS block and
it reads:

\`\`\`
GPS Latitude  : 27.1751
GPS Longitude : 78.0421
\`\`\`

Drop those coordinates into any map and they land squarely on one of the most
photographed buildings on Earth — a white marble mausoleum in Agra, India.

**Submit** the name of that monument, lower-case with an underscore, as
\`flag{two_words_snake_case}\`.`,
      flag: 'flag{taj_mahal}',
      hints: [
        {
          content: 'Agra, India. A marble mausoleum built by a Mughal emperor for his wife.',
          cost: 0,
        },
        { content: 'taj + mahal.', cost: 15 },
      ],
    },
    {
      slug: 'osint-ctf-born-online',
      title: 'Born Online',
      difficulty: 'MEDIUM',
      points: 150,
      description: `Domain age is one of the fastest credibility checks an investigator has: a
brand-new domain impersonating a decades-old company is a red flag. Reading a
WHOIS record means reading its **Creation Date**.

\`\`\`
whois google.com
   ...
   Creation Date: 1997-09-15T04:00:00Z
\`\`\`

That single line settles when the world's best-known search domain was first
registered.

**Submit** the four-digit year from its Creation Date as \`flag{YYYY}\`.`,
      flag: 'flag{1997}',
      hints: [
        { content: 'It is printed verbatim in the record above.', cost: 0 },
        { content: 'Late 1990s — the year before the company was even incorporated.', cost: 10 },
      ],
    },
    {
      slug: 'osint-ctf-mail-trail',
      title: 'The Mail Trail',
      difficulty: 'MEDIUM',
      points: 150,
      description: `TXT records are a quiet goldmine — organisations publish an **SPF** record listing
who is allowed to send mail for them, and it often names their email provider
outright. You query a target and get back:

\`\`\`
dig acme-corp.com TXT
"v=spf1 include:_spf.google.com ~all"
\`\`\`

The \`include:\` points at exactly one company's mail infrastructure, telling you
which provider runs this organisation's email.

**Submit** that provider's one-word name, lower-case, as \`flag{name}\`.`,
      flag: 'flag{google}',
      hints: [
        { content: 'Read the host inside `include:` — `_spf.____.com`.', cost: 0 },
        { content: 'The same company as Gmail / Workspace.', cost: 10 },
      ],
    },
    {
      slug: 'osint-ctf-public-record',
      title: 'Hidden in the Public Record',
      difficulty: 'HARD',
      points: 200,
      description: `Every TLS certificate is logged publicly, so a single **certificate transparency**
search surfaces hostnames a company never advertised. You search crt.sh for
\`%.acme-corp.com\` and it returns three internal-sounding subdomains:

\`\`\`
gitlab.acme-corp.com
vpn.acme-corp.com
vault.acme-corp.com
\`\`\`

Each is a foothold, but one stands out: the host whose name is literally a
well-known **secrets manager**, the place an org keeps its API keys, database
passwords, and certificates. Crack that and you own everything.

**Submit** the subdomain label (the first word of that hostname) as \`flag{name}\`.`,
      flag: 'flag{vault}',
      hints: [
        {
          content: 'Not the code host, not the remote-access box — the one that stores secrets.',
          cost: 0,
        },
        { content: "HashiCorp's secrets manager shares its name. Five letters.", cost: 20 },
      ],
    },
    {
      slug: 'osint-ctf-old-leak',
      title: 'An Old Leak',
      difficulty: 'MEDIUM',
      points: 150,
      description: `Checking a target's email against breach data, you get a hit on a single, famous
incident:

\`\`\`
haveibeenpwned.com → 1 breach
  Breach:   2012
  Accounts: 167,370,910
  Type:     professional / business social network
\`\`\`

A 2012 breach of a **professional networking** site, eventually totalling ~167
million accounts, is one of the most infamous credential leaks ever — its dumped
passwords still fuel credential-stuffing today.

**Submit** the one-word name of that company, lower-case, as \`flag{name}\`.`,
      flag: 'flag{linkedin}',
      hints: [
        { content: 'The professional network where people post résumés and connections.', cost: 0 },
        { content: 'linked + in.', cost: 10 },
      ],
    },
  ],
}
