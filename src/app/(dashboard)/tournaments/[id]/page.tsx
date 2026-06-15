import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ResultForm } from '@/components/ui/ResultForm'
import { DeleteResultButton } from '@/components/ui/DeleteResultButton'
import { DeleteTournamentButton } from '@/components/ui/DeleteTournamentButton'
import { addResult } from '@/app/actions/tournaments'

const ROUND_LABEL: Record<string, string> = {
  winner:       '\ud83c\udfc6 Campe\u00f3n',
  final:        'Final',
  semifinal:    'Semifinal',
  quarterfinal: 'Cuartos de final',
  groups:       'Fase de grupos',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

type TournamentResult = {
  id: string
  partner_name: string | null
  final_round: string | null
  sets_won: number | null
  sets_lost: number | null
  notes: string | null
  players: { id: string; full_name: string } | null
}

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tournament) notFound()

  const { data: results } = await supabase
    .from('tournament_results')
    .select('id, partner_name, final_round, sets_won, sets_lost, notes, players(id, full_name)')
    .eq('tournament_id', id) as { data: TournamentResult[] | null }

  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .order('full_name')

  const addResultAction = addResult.bind(null, id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/tournaments" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          \u2190 Torneos
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{tournament.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(tournament.start_date)}
            {tournament.end_date && tournament.end_date !== tournament.start_date
              ? ` \u2013 ${formatDate(tournament.end_date)}`
              : ''}
          </p>
        </div>

        {/* Meta */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
          {[
            { label: 'Ubicaci\u00f3n', value: tournament.location || '\u2014' },
            { label: 'Categor\u00eda', value: tournament.category || '\u2014' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-5 py-4">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Results */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Resultados</h2>

          {results && results.length > 0 ? (
            <ul className="space-y-3 mb-6">
              {results.map((r) => (
                <li key={r.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{r.players?.full_name ?? '\u2014'}</span>
                    <DeleteResultButton
                      resultId={r.id}
                      tournamentId={id}
                      playerName={r.players?.full_name ?? 'este jugador'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    {r.partner_name && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-500">Pareja</span>
                        <span className="font-medium text-gray-900">{r.partner_name}</span>
                      </div>
                    )}
                    {r.final_round && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-500">Ronda</span>
                        <span className="font-medium text-gray-900">{ROUND_LABEL[r.final_round] ?? r.final_round}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sets ganados</span>
                      <span className="font-medium text-green-700">{r.sets_won ?? 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sets perdidos</span>
                      <span className="font-medium text-red-500">{r.sets_lost ?? 0}</span>
                    </div>
                  </div>
                  {r.notes && (
                    <p className="mt-3 text-xs text-gray-400 border-t border-gray-50 pt-3">{r.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6 bg-white border border-gray-100 rounded-2xl mb-6">
              Sin resultados todav\u00eda.
            </p>
          )}

          {players && players.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">A\u00f1adir resultado</p>
              <ResultForm action={addResultAction} players={players} />
            </div>
          )}
        </div>

        {/* Delete */}
        <div className="pt-2">
          <DeleteTournamentButton id={id} name={tournament.name} />
        </div>

      </main>
    </div>
  )
}
