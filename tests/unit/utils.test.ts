import { describe, expect, it } from 'vitest'

import { cn } from '@/lib/utils'

// Smoke test — proves the Vitest harness, the `@/` alias, and tailwind-merge
// are all wired correctly. Real domain tests (auth, flag submission, scoring)
// arrive with their phases.
describe('cn', () => {
  it('merges conflicting tailwind classes, last one wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('drops falsy values', () => {
    expect(cn('text-accent', false, undefined, 'font-mono')).toBe('text-accent font-mono')
  })
})
