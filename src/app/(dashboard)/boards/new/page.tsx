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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/boards" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Pizarras
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Nueva pizarra</h1>
        <p className="text-sm text-gray-500 mb-6">Dale un título; el lienzo empieza en blanco.</p>

        <form action={createBoard} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="Ej. Salida con globo + cierre en red"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {strategies && strategies.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vincular a una estrategia (opcional)</label>
              <select
                name="strategy_id"
                defaultValue={strategy_id ?? ''}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
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
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Crear pizarra
          </button>
        </form>
      </main>
    </div>
  )
}
