import type { SeedCategory } from './types'

/**
 * Launch categories. `order` controls catalog position; `linux` (order 2) is
 * introduced with the Linux courses. Categories with no published paths are
 * hidden from the catalog, so listing an empty one here is harmless.
 */
export const CATEGORIES: SeedCategory[] = [
  {
    slug: 'web',
    name: 'Web Security',
    description: 'Exploit and defend the modern web — the OWASP Top 10 and beyond.',
    icon: 'globe',
    order: 1,
  },
  {
    slug: 'linux',
    name: 'Linux',
    description: 'Live on the command line — navigate, search, and administer a Unix system.',
    icon: 'terminal',
    order: 2,
  },
  {
    slug: 'osint',
    name: 'OSINT',
    description: 'Open-source intelligence: find what people leave in the open.',
    icon: 'search',
    order: 3,
  },
  {
    slug: 'crypto',
    name: 'Cryptography',
    description: 'Break weak schemes and learn what real cryptographic strength looks like.',
    icon: 'lock',
    order: 4,
  },
  {
    slug: 'forensics',
    name: 'Forensics',
    description: 'Recover the truth from files, packets, and memory.',
    icon: 'fingerprint',
    order: 5,
  },
]
