import type { SeedCourse } from './types'

/**
 * OSINT Fundamentals — a taught course in open-source intelligence: the toolkit
 * for finding what people and organisations leave in the open. Every technique
 * here uses only public data. Each lesson ends in a recall flag.
 */
export const osintFundamentals: SeedCourse = {
  categorySlug: 'osint',
  slug: 'osint-fundamentals',
  title: 'OSINT Fundamentals',
  summary:
    'The investigator toolkit: search operators, image metadata, WHOIS, DNS, certificate logs, username pivots, web archives, and breach data.',
  difficulty: 'EASY',
  order: 1,
  challenges: [
    {
      slug: 'osint-google-dorking',
      title: 'Search Like You Mean It',
      difficulty: 'EASY',
      points: 50,
      description: `A search engine indexes far more than people realise — including files nobody
meant to publish. **Search operators** turn an ordinary query into a precision
instrument:

\`\`\`
site:example.com filetype:pdf           # PDFs hosted on one domain
intitle:"index of" "parent directory"   # open directory listings
inurl:admin                             # login panels in the URL
"@example.com" filetype:xlsx            # spreadsheets leaking emails
\`\`\`

\`site:\` restricts to a domain, \`filetype:\` to a format, \`intitle:\` and \`inurl:\`
to words in the title or address. Stacking them is how researchers — and
attackers — surface exposed backups, config files, and credentials that were
never linked anywhere. The practice is named after the researcher who catalogued
it.

**Submit** the two-word name for using advanced search operators to dig up
exposed information as \`flag{two_words_snake_case}\`.`,
      flag: 'flag{google_dorking}',
      hints: [
        { content: "Popularised by Johnny Long; also called 'Google hacking'.", cost: 0 },
        { content: 'google + dorking.', cost: 5 },
      ],
    },
    {
      slug: 'osint-exif-metadata',
      title: 'The Camera Remembers',
      difficulty: 'EASY',
      points: 50,
      description: `That holiday photo someone posted carries more than pixels. Cameras and phones
embed a block of **metadata** in every image — the make and model, the exact
timestamp, exposure settings, and very often the **GPS coordinates** of where the
shot was taken:

\`\`\`
exiftool beach.jpg | grep GPS
GPS Position : 48 deg 51' 30" N, 2 deg 17' 40" E
\`\`\`

Those coordinates drop a pin on the Eiffel Tower. Investigators pull this to
geolocate a subject from a single picture; the privacy-aware strip it before
posting. The metadata standard that stores all of it inside JPEG and TIFF files
has a short, four-letter name.

**Submit** that metadata standard as \`flag{name}\`.`,
      flag: 'flag{exif}',
      hints: [
        { content: 'Exchangeable Image File format — tools like `exiftool` read it.', cost: 0 },
        { content: 'Four letters: e-x-i-f.', cost: 5 },
      ],
    },
    {
      slug: 'osint-whois',
      title: 'Who Owns This?',
      difficulty: 'EASY',
      points: 50,
      description: `Behind every domain name is a registration record. One lookup reveals when the
domain was created, the registrar, the expiry date, and the name servers it
relies on:

\`\`\`
whois example.com
\`\`\`

For an investigator it's a starting thread. A creation date of *yesterday* on a
"bank" domain screams phishing; shared name servers or a contact email (when not
hidden behind privacy protection) quietly link a domain to others run by the same
operator. The protocol — and the command — that answers "who is behind this
domain?" is named for that very question.

**Submit** it as \`flag{name}\`.`,
      flag: 'flag{whois}',
      hints: [
        { content: 'Read the question it answers out loud, as one word.', cost: 0 },
        { content: 'who + is.', cost: 5 },
      ],
    },
    {
      slug: 'osint-dns-recon',
      title: 'Asking the Directory',
      difficulty: 'MEDIUM',
      points: 75,
      description: `A domain name is just a friendly label; **DNS** is the directory that resolves it
into the records that actually route traffic. Query it directly and you map a
target's infrastructure for free:

\`\`\`
dig example.com A       # the IPv4 address
dig example.com MX      # the mail servers
dig example.com TXT     # SPF, DKIM, domain-verification strings
dig example.com NS      # the authoritative name servers
\`\`\`

\`A\` records point to servers, \`MX\` reveals who runs the mail, and \`TXT\` records
routinely leak which SaaS products an organisation has verified. The classic
command-line resolver used above — short for *Domain Information Groper* — has a
three-letter name.

**Submit** that tool as \`flag{name}\`.`,
      flag: 'flag{dig}',
      hints: [
        { content: 'You "___" for DNS records. Domain Information Groper.', cost: 0 },
        { content: 'Three letters: d-i-g.', cost: 10 },
      ],
    },
    {
      slug: 'osint-certificate-transparency',
      title: 'Every Certificate Is Public',
      difficulty: 'MEDIUM',
      points: 100,
      description: `When a site is issued a TLS certificate, that certificate is written to a public,
append-only log that anyone can search — a safeguard built to catch mis-issued
certificates. It has a powerful side effect for investigators: every certificate
spells out the exact hostnames it covers.

\`\`\`
# a search at crt.sh for %.example.com returns:
vpn.example.com   staging.example.com   jenkins.example.com
\`\`\`

So one query uncovers internal-sounding **subdomains** — \`staging\`, \`vpn\`,
\`jenkins\` — that the organisation never advertised and may have meant to keep
quiet. The public-log system that makes every issued certificate searchable has a
two-word name.

**Submit** it as \`flag{two_words_snake_case}\`.`,
      flag: 'flag{certificate_transparency}',
      hints: [
        {
          content: 'The "CT logs" that crt.sh searches — certificates are made fully ___.',
          cost: 0,
        },
        { content: 'certificate + transparency.', cost: 15 },
      ],
    },
    {
      slug: 'osint-username-enumeration',
      title: 'One Name, Many Sites',
      difficulty: 'MEDIUM',
      points: 75,
      description: `People are creatures of habit: the handle someone picks on one site tends to
reappear on dozens of others. Pivot from a single username and you can assemble a
person's whole online footprint:

\`\`\`
sherlock johndoe
[+] GitHub:    https://github.com/johndoe
[+] Reddit:    https://reddit.com/user/johndoe
[+] Instagram: https://instagram.com/johndoe
\`\`\`

The tool above checks one username against hundreds of social networks in a
single sweep, turning a lone alias into a map of accounts to investigate. It's
the best-known username-enumeration tool, named after a certain fictional
detective.

**Submit** that tool's name as \`flag{name}\`.`,
      flag: 'flag{sherlock}',
      hints: [
        { content: "Named after fiction's most famous detective, of 221B Baker Street.", cost: 0 },
        { content: 's-h-e-r-l-o-c-k.', cost: 10 },
      ],
    },
    {
      slug: 'osint-wayback-machine',
      title: 'The Internet Never Forgets',
      difficulty: 'EASY',
      points: 50,
      description: `A page that was deleted, edited, or quietly taken down isn't necessarily gone.
Web archives crawl the internet and store **dated snapshots**, letting you read a
site exactly as it looked years ago — before someone scrubbed an incriminating
bio, an old price, or a staff list:

\`\`\`
https://web.archive.org/web/2017*/example.com
\`\`\`

Investigators lean on it to recover removed content and to prove what a page once
said. The most famous of these archives, run by the Internet Archive, has a
two-word name.

**Submit** it as \`flag{two_words_snake_case}\`.`,
      flag: 'flag{wayback_machine}',
      hints: [
        {
          content: "The Internet Archive's snapshot tool — it takes you 'way back' in time.",
          cost: 0,
        },
        { content: 'wayback + machine.', cost: 5 },
      ],
    },
    {
      slug: 'osint-breach-data',
      title: 'Have You Been Pwned?',
      difficulty: 'EASY',
      points: 50,
      description: `Billions of credentials have leaked in data breaches, and they're aggregated into
searchable collections. Before cracking anything, an investigator simply asks
whether a target's email already appears in a known breach:

\`\`\`
# haveibeenpwned.com
alice@example.com  →  found in 4 breaches (LinkedIn, Adobe, …)
\`\`\`

A hit tells you which services the person used and which old passwords might
still be reused elsewhere — the fuel for **credential stuffing**. The best-known
free service for checking an email against breach corpora goes by a four-letter
acronym.

**Submit** that acronym, lower-case, as \`flag{acronym}\`.`,
      flag: 'flag{hibp}',
      hints: [
        { content: 'Have I Been Pwned.', cost: 0 },
        { content: 'h-i-b-p.', cost: 5 },
      ],
    },
  ],
}
