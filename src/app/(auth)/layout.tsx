import Link from 'next/link'

import { GridBackdrop } from '@/components/brand/grid-backdrop'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center px-6 py-16">
      <GridBackdrop />
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 block text-center font-mono text-sm tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
        >
          [ cyberlearn ]
        </Link>
        {children}
      </div>
    </main>
  )
}
