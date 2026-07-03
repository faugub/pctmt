export default function Loading() {
  return (
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">
      <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-7 w-36 bg-muted rounded animate-pulse" />
        <div className="h-4 w-52 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-muted rounded-full animate-pulse" />
        <div className="h-8 w-28 bg-muted rounded-full animate-pulse" />
        <div className="h-8 w-36 bg-muted rounded-full animate-pulse" />
      </div>
      <div className="relative pl-10">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <li key={i} className="relative">
              <div className="absolute -left-7 top-3.5 w-4 h-4 rounded-full bg-muted animate-pulse" />
              <div className="bg-muted rounded-2xl h-20 animate-pulse" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
