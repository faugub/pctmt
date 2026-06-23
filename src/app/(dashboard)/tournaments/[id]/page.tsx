import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ResultForm } from '@/components/ui/ResultForm'
import { DeleteResultButton } from '@/components/ui/DeleteResultButton'
import { DeleteTournamentButton } from '@/components/ui/DeleteTournamentButton'
import { addResult } from '@/app/actions/tournaments'

const ROUND_LABEL: Record<string, string> = {
  winner:       '🏆 Campeón',
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
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

      <Link href="/tournaments" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Competencias
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{tournament.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDate(tournament.start_date)}
            {tournament.end_date && tournament.end_date !== tournament.start_date
              ? ` – ${formatDate(tournament.end_date)}`
              : ''}
          </p>
        </div>
        <Link
          href={`/tournaments/${id}/edit`}
          className="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          Editar
        </Link>
      </div>

      {/* Meta */}
      <div className="bg-card border border-border rounded-2xl shadow-sm divide-y divide-border">
        {[
          { label: 'Ubicación', value: tournament.location || '—' },
          { label: 'Categoría', value: tournament.category || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center px-5 py-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Results */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-1">Resultados de tus alumnos</h2>
        <p className="text-xs text-muted-foreground mb-4">Quién compitió, con quién, y qué tan lejos llegó.</p>

        {results && results.length > 0 ? (
          <ul className="space-y-3 mb-6">
            {results.map((r) => (
              <li key={r.id} className="bg-card border border-border rounded-2xl shadow-sm px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{r.players?.full_name ?? '—'}</span>
                  <DeleteResultButton
                    resultId={r.id}
                    tournamentId={id}
                    playerName={r.players?.full_name ?? 'este jugador'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  {r.partner_name && (
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground">Pareja</span>
                      <span className="font-medium text-foreground">{r.partner_name}</span>
                    </div>
                  )}
                  {r.final_round && (
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground">Ronda</span>
                      <span className="font-medium text-foreground">{ROUND_LABEL[r.final_round] ?? r.final_round}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sets ganados</span>
                    <span className="font-medium text-green-700">{r.sets_won ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sets perdidos</span>
                    <span className="font-medium text-red-500">{r.sets_lost ?? 0}</span>
                  </div>
                </div>
                {r.notes && (
                  <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">{r.notes}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6 bg-card border border-border rounded-2xl mb-6">
            Sin resultados todavía.
          </p>
        )}

        {players && players.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <p className="text-sm font-semibold text-foreground mb-4">Añadir resultado</p>
            <ResultForm action={addResultAction} players={players} />
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="pt-2">
        <DeleteTournamentButton id={id} name={tournament.name} />
      </div>

    </main>
  )
}
