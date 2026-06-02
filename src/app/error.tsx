'use client'

import { useEffect } from 'react'

import { BracketLabel } from '@/components/brand/bracket-label'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Details stay server-side; we never surface internals to the client.
    // Wired to real observability in a later phase.
    console.error(error)
  }, [error])

  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <BracketLabel className="text-destructive">error // 500</BracketLabel>
        <h1 className="mt-6 font-display text-5xl font-bold tracking-tight">something broke</h1>
        <p className="mt-3 font-mono text-sm text-muted-foreground">
          an unexpected error occurred. the details stay server-side.
        </p>
        <Button onClick={reset} variant="outline" className="mt-8">
          retry
        </Button>
      </div>
    </main>
  )
}
