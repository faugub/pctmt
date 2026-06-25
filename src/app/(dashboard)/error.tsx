'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Logged client-side for now; revisit once we have a real error-tracking
    // sink (Phase 7+). Keeping this minimal avoids a new dependency.
    console.error('[dashboard error boundary]', error)
  }, [error])

  return (
    <main className="max-w-md mx-auto px-6 py-20 text-center">
      <p className="text-3xl mb-3" aria-hidden>
        ⚠️
      </p>
      <h1 className="text-lg font-semibold text-foreground">Algo salió mal</h1>
      <p className="text-sm text-muted-foreground mt-1">
        No pudimos cargar esta página. Probá de nuevo — si sigue pasando, avisale a Fau.
      </p>
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 border border-border text-sm font-medium rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Ir al panel
        </Link>
      </div>
    </main>
  )
}
