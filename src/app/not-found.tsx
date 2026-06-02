import Link from 'next/link'

import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <BracketLabel>error // 404</BracketLabel>
        <h1 className="mt-6 font-display text-6xl font-bold tracking-tight">404</h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          this route never existed. or it got patched.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/">cd ~</Link>
        </Button>
      </div>
    </main>
  )
}
