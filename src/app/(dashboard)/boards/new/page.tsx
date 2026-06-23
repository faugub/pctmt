import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createBoard } from '@/app/actions/boards'

export default async function NewBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ strategy_id?: string }>
}) {
  const { strategy_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: strategies } = await supabase
    .from('strategies')
    .select('id, title')
    .order('title', { ascending: true })

  return (
    <main className="max-w-md mx-auto px-6 py-10">
      <Link href="/boards" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Pizarras
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">Nueva pizarra</h1>
      <p className="text-sm text-muted-foreground mb-6">Dale un título; el lienzo empieza en blanco.</p>

      <form action={createBoard} className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="Ej. Salida con globo + cierre en red"
            className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {strategies && strategies.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Vincular a una estrategia (opcional)</label>
            <select
              name="strategy_id"
              defaultValue={strategy_id ?? ''}
              className="w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sin vincular</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          Crear pizarra
        </button>
      </form>
    </main>
  )
}
