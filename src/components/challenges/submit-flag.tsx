'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitFlagSchema } from '@/schemas/challenge'

const ACHIEVEMENT_NAMES: Record<string, string> = {
  'first-blood': 'First Blood',
  'getting-started': 'Getting Started',
  centurion: 'Centurion',
  'owasp-master': 'OWASP Master',
}

function prettifyAchievement(slug: string): string {
  return ACHIEVEMENT_NAMES[slug] ?? slug.replace(/-/g, ' ')
}

type Status = 'idle' | 'wrong' | 'captured' | 'solved'

export function SubmitFlag({
  slug,
  solved,
  authed,
}: {
  slug: string
  solved: boolean
  authed: boolean
}) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [flag, setFlag] = useState('')
  const [status, setStatus] = useState<Status>(solved ? 'solved' : 'idle')
  const [awarded, setAwarded] = useState<number | null>(null)
  const [firstBlood, setFirstBlood] = useState(false)
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  if (!authed) {
    return (
      <div className="rounded-md border border-border bg-surface p-4 text-sm text-muted-foreground">
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>{' '}
        to submit a flag.
      </div>
    )
  }

  if (status === 'captured' || status === 'solved') {
    return (
      <motion.div
        initial={reduceMotion ? false : { scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="ring-glow rounded-md border border-accent/40 bg-accent-muted p-4"
      >
        <p className="font-mono text-sm text-success">
          [ CAPTURED ]
          {firstBlood ? ' first blood ·' : ''}
          {status === 'captured' && awarded !== null ? ` +${awarded} pts` : ' challenge solved'}
        </p>
        {unlocked.length > 0 && (
          <ul className="mt-2 space-y-1">
            {unlocked.map((slug) => (
              <li key={slug} className="font-mono text-xs text-accent">
                ★ achievement unlocked — {prettifyAchievement(slug)}
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsed = submitFlagSchema.safeParse({ flag })
    if (!parsed.success) return
    setLoading(true)
    setStatus('idle')
    try {
      const res = await fetch(`/api/challenges/${slug}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ flag }),
      })
      const data = await res.json()
      if (data?.correct) {
        if (data.alreadySolved) {
          setStatus('solved')
        } else {
          setStatus('captured')
          setAwarded(data.awardedPoints ?? 0)
          setFirstBlood(Boolean(data.firstBlood))
          setUnlocked(Array.isArray(data.newAchievements) ? data.newAchievements : [])
        }
        router.refresh()
      } else {
        setStatus('wrong')
      }
    } catch {
      setStatus('wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="flag{...}"
          aria-label="flag"
          className="flex-1"
        />
        <Button type="submit" disabled={loading || flag.trim().length === 0}>
          {loading ? '…' : 'submit'}
        </Button>
      </div>
      {status === 'wrong' && (
        <p className="font-mono text-sm text-destructive">[ rejected ] not the flag — try again</p>
      )}
    </form>
  )
}
