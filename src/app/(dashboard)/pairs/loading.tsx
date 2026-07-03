export default function Loading() {
  return (
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="h-7 w-36 bg-muted rounded animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
      </div>
      <ul className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="h-16 bg-muted rounded-2xl animate-pulse" />
        ))}
      </ul>
    </main>
  )
}
