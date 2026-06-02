import { rankForPoints } from '@/config/scoring'

export function RankProgress({ points }: { points: number }) {
  const { rank, nextRank, pointsToNext, progress } = rankForPoints(points)

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">rank</p>
          <p className="mt-1 font-display text-xl font-bold text-accent">{rank}</p>
        </div>
        {nextRank ? (
          <p className="font-mono text-xs text-muted-foreground">
            {pointsToNext} pts → {nextRank}
          </p>
        ) : (
          <p className="font-mono text-xs text-accent">max rank</p>
        )}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  )
}
