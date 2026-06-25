type SkeletonProps = {
  className?: string
}

/** Base pulsing block. Compose with width/height classes via `className`. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} aria-hidden />
}

/** Mimics a list-item card (player row, session row, etc). */
export function SkeletonCard() {
  return (
    <div className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
  )
}

/** A vertical stack of SkeletonCard, for list pages (players, sessions, strategies...). */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <ul className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  )
}

/** Page header skeleton: title + subtitle + action button, matching the list-page header pattern. */
export function SkeletonPageHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-9 w-32 rounded-lg" />
    </div>
  )
}
