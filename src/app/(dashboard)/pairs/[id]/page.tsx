import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeletePairButton } from '@/components/ui/DeletePairButton'

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica',
  physical:  'Física',
  tactical:  'Táctica',
  match:     'Partido',
  mixed:     'Mixta',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

type PlayerRef = { id: string; full_name: string }
type TrainingBlockRef = { concept_tags: string[]; decision_tags: string[] }
type SessionBlockRef  = { training_blocks: TrainingBlockRef | null }
type SharedSession = {
  id: string
  title: string
  session_date: string
  session_type: string | null
  objectives: string | null
  session_blocks: SessionBlockRef[]
}

export default async function PairPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pair, error } = await supabase
    .from('pairs')
    .select('id, name, notes, player1_id, player2_id')
    .eq('id', id)
    .single()

  if (error || !pair) notFound()

  // Fetch both player profiles in one query
  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .in('id', [pair.player1_id, pair.player2_id]) as { data: PlayerRef[] | null }

  const playerMap = new Map(players?.map(p => [p.id, p]) ?? [])
  const player1 = playerMap.get(pair.player1_id)
  const player2 = playerMap.get(pair.player2_id)

  // Shared sessions: parallel lookups then set intersection
  const [{ data: sp1 }, { data: sp2 }] = await Promise.all([
    supabase
      .from('session_players')
      .select('session_id')
      .eq('player_id', pair.player1_id)
      .eq('attended', true),
    supabase
      .from('session_players')
      .select('session_id')
      .eq('player_id', pair.player2_id)
      .eq('attended', true),
  ])

  const set1 = new Set((sp1 ?? []).map(r => r.session_id as string))
  const sharedIds = (sp2 ?? [])
    .map(r => r.session_id as string)
    .filter(sid => set1.has(sid))

  let sharedSessions: SharedSession[] = []
  if (sharedIds.length > 0) {
    const { data } = await supabase
      .from('sessions')
      .select(`
        id, title, session_date, session_type, objectives,
        session_blocks (
          training_blocks (
            concept_tags, decision_tags
          )
        )
      `)
      .in('id', sharedIds)
      .order('session_date', { ascending: false }) as { data: SharedSession[] | null }
    sharedSessions = data ?? []
  }

  // Concept frequency across shared sessions
  const conceptFreq: Record<string, number> = {}
  for (const sess of sharedSessions) {
    for (const sb of sess.session_blocks ?? []) {
      for (const tag of sb.training_blocks?.concept_tags ?? []) {
        conceptFreq[tag] = (conceptFreq[tag] ?? 0) + 1
      }
    }
  }
  const topConcepts = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const pairLabel = pair.name ?? `${player1?.full_name ?? '?'} / ${player2?.full_name ?? '?'}`

  return (
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

      <Link href="/pairs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Sociedades
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{pairLabel}</h1>
          {pair.name && (
            <p className="text-sm text-muted-foreground mt-1">
              {player1?.full_name ?? '?'} · {player2?.full_name ?? '?'}
            </p>
          )}
        </div>
        <Link
          href={`/pairs/${id}/edit`}
          className="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Player cards */}
      <div className="bg-card border border-border rounded-2xl shadow-sm divide-y divide-border">
        {[player1, player2].map((p, i) =>
          p ? (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-muted transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <span className="text-sm font-medium text-foreground">{p.full_name}</span>
              <span className="text-muted-foreground text-sm">→</span>
            </Link>
          ) : (
            <div key={i} className="px-5 py-4">
              <span className="text-sm text-muted-foreground">Jugador eliminado</span>
            </div>
          )
        )}
      </div>

      {/* Top concepts worked together */}
      {topConcepts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Conceptos trabajados juntos</p>
          <div className="flex flex-wrap gap-2">
            {topConcepts.map(([tag, count]) => (
              <span key={tag} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm rounded-full">
                {tag} ×{count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {pair.notes && (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Notas de la sociedad</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{pair.notes}</p>
        </div>
      )}
      {!pair.notes && (
        <Link
          href={`/pairs/${id}/edit`}
          className="block text-center py-4 border border-dashed border-border rounded-2xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
        >
          + Añadir notas de la sociedad
        </Link>
      )}

      {/* Shared sessions */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          Sesiones juntos
          {sharedSessions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({sharedSessions.length})</span>
          )}
        </h2>

        {sharedSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 bg-card border border-border rounded-2xl">
            Todavía no entrenaron juntos. Cuando ambos asistan a una sesión aparecerá aquí.
          </p>
        ) : (
          <ul className="space-y-2">
            {sharedSessions.map(sess => {
              const concepts = Array.from(new Set(
                (sess.session_blocks ?? []).flatMap(sb => sb.training_blocks?.concept_tags ?? [])
              ))
              const decisions = Array.from(new Set(
                (sess.session_blocks ?? []).flatMap(sb => sb.training_blocks?.decision_tags ?? [])
              ))
              return (
                <li key={sess.id}>
                  <Link
                    href={`/sessions/${sess.id}`}
                    className="block bg-card border border-border rounded-2xl shadow-sm px-4 py-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{sess.title}</p>
                      {sess.session_type && (
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full flex-shrink-0">
                          {TYPE_LABEL[sess.session_type] ?? sess.session_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(sess.session_date)}</p>
                    {sess.objectives && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{sess.objectives}</p>
                    )}
                    {(concepts.length > 0 || decisions.length > 0) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {concepts.map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">{t}</span>
                        ))}
                        {decisions.map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Delete */}
      <div className="pt-2">
        <DeletePairButton id={id} label={pairLabel} />
      </div>

    </main>
  )
}
