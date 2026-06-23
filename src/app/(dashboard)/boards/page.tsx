import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function BoardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: boards, error } = await supabase
    .from('tactic_boards')
    .select('id, title, updated_at, strategies(title)')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pizarras tácticas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{boards?.length ?? 0} pizarras</p>
        </div>
        <Link
          href="/boards/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva pizarra
        </Link>
      </div>

      {boards && boards.length > 0 ? (
        <ul className="space-y-2">
          {boards.map((b) => {
            const strategyTitle = (b.strategies as unknown as { title: string } | null)?.title
            return (
              <li key={b.id}>
                <Link
                  href={`/boards/${b.id}`}
                  className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Editada {formatDate(b.updated_at)}
                      {strategyTitle ? ` · vinculada a "${strategyTitle}"` : ''}
                    </p>
                  </div>
                  <span className="text-muted-foreground text-lg">›</span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">🎾</p>
          <p className="text-sm">Todavía no hay pizarras.</p>
          <Link href="/boards/new" className="text-sm text-foreground underline mt-2 inline-block">
            Crea la primera
          </Link>
        </div>
      )}
    </main>
  )
}
