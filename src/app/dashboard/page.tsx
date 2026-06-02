import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/auth/logout-button'
import { BracketLabel } from '@/components/brand/bracket-label'
import { GridBackdrop } from '@/components/brand/grid-backdrop'
import { TerminalFrame } from '@/components/brand/terminal-frame'
import { getSession } from '@/server/auth/session'

export const metadata: Metadata = { title: 'Dashboard' }
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSession()
  if (!user) redirect('/login')

  return (
    <main className="relative isolate min-h-dvh px-6 py-16">
      <GridBackdrop />
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <BracketLabel>dashboard</BracketLabel>
          <LogoutButton />
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight">
          Welcome, <span className="text-accent text-accent-glow">{user.username}</span>
        </h1>
        <p className="mt-2 max-w-prose text-muted-foreground">
          You&apos;re signed in. The challenge engine lands in the next phase — for now, the door is
          open and the session is real.
        </p>

        <TerminalFrame label="~/session" className="mt-10 max-w-md">
          <p className="text-muted-foreground">
            <span className="text-accent">user</span>&nbsp;&nbsp;&nbsp;{user.username}
          </p>
          <p className="text-muted-foreground">
            <span className="text-accent">email</span>&nbsp;&nbsp;{user.email}
          </p>
          <p className="text-muted-foreground">
            <span className="text-accent">role</span>&nbsp;&nbsp;&nbsp;{user.role.toLowerCase()}
          </p>
          <p className="mt-2 text-success">[ authenticated ] httpOnly session active</p>
        </TerminalFrame>
      </div>
    </main>
  )
}
