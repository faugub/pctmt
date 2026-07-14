import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AttendanceToggle } from '@/components/ui/AttendanceToggle'
import { DeleteSessionButton } from '@/components/ui/DeleteSessionButton'
import { SessionBlocksPanel, type LibraryBlock, type SessionBlockRow } from '@/components/ui/SessionBlocksPanel'

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica',
  physical:  'Física',
  tactical:  'Táctica',
  match:     'Partido',
  mixed:     'Mixta',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    timeZone: 'UTC',
  })
}

type SessionPlayer = {
  player_id: string
  attended: boolean
  players: { full_name: string } | null
}

type RawSessionBlock = {
  id: string
  sort_order: number
  completed: boolean
  duration_override: number | null
  training_blocks: { title: string; block_type: string; duration_min: number | null } | null
}

type PlanContext = {
  id: string
  session_number: number
  status: string
  training_plans: { id: string; title: string } | null
  plan_phases: { id: string; title: string; color: string | null } | null
}

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !session) notFound()

  const [{ data: sessionPlayers }, { data: rawSessionBlocks }, { data: library }, { data: planContext }]
    = await Promise.all([
      supabase
        .from('session_players')
        .select('player_id, attended, players(full_name)')
        .eq('session_id', id) as Promise<{ data: SessionPlayer[] | null }>,

      supabase
        .from('session_blocks')
        .select('id, sort_order, completed, duration_override, training_blocks(title, block_type, duration_min)')
        .eq('session_id', id)
        .order('sort_order', { ascending: true }) as Promise<{ data: RawSessionBlock[] | null }>,

      supabase
        .from('training_blocks')
        .select('id, title, block_type, duration_min')
        .order('created_at', { ascending: false }) as Promise<{ data: LibraryBlock[] | null }>,

      supabase
        .from('plan_sessions')
        .select('id, session_number, status, training_plans(id, title), plan_phases(id, title, color)')
        .eq('session_id', id)
        .maybeSingle() as Promise<{ data: PlanContext | null }>,
    ])

  const sessionBlocks: SessionBlockRow[] = (rawSessionBlocks ?? [])
    .filter(r => r.training_blocks !== null)
    .map(r => ({
      id: r.id,
      title: r.training_blocks!.title,
      block_type: r.training_blocks!.block_type,
      duration_min: r.duration_override ?? r.training_blocks!.duration_min,
      completed: r.completed,
      sort_order: r.sort_order,
    }))

  const attended = sessionPlayers?.filter(sp => sp.attended).length ?? 0
  const total    = sessionPlayers?.length ?? 0

  return (
    <main className="max-w-lg mx-auto px-6 py-8 space-y-8">

      <Link href="/sessions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Sesiones
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{session.title}</h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{formatDate(session.session_date)}</p>
          {(session.duration_min || session.session_type) && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {session.session_type ? TYPE_LABEL[session.session_type] ?? session.session_type : null}
              {session.session_type && session.duration_min ? ' · ' : null}
              {session.duration_min ? `${session.duration_min} min` : null}
            </p>
          )}
        </div>
        <Link
          href={`/sessions/${id}/edit`}
          className="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          Editar
        </Link>
      </div>

      {/* ── ASISTENCIA — first because it's the primary courtside action ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Asistencia</h2>
          {total > 0 && (
            <span className={`text-sm font-medium ${
              attended === total ? 'text-green-600' : 'text-muted-foreground'
            }`}>
              {attended}/{total} presentes
            </span>
          )}
        </div>
        {sessionPlayers && sessionPlayers.length > 0 ? (
          <div className="space-y-2">
            {sessionPlayers.map(sp => (
              <AttendanceToggle
                key={sp.player_id}
                sessionId={id}
                playerId={sp.player_id}
                initialAttended={sp.attended}
                playerName={sp.players?.full_name ?? 'Jugador'}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-6 bg-card border border-border rounded-2xl">
            No hay jugadores en esta sesión.
          </p>
        )}
      </div>

      {/* ── BLOQUES ── */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Bloques</h2>
        <SessionBlocksPanel sessionId={id} initialBlocks={sessionBlocks} library={library ?? []} />
      </div>

      {/* ── PLAN ── */}
      {planContext?.training_plans && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Plan</h2>
          <Link
            href={`/plans/${planContext.training_plans.id}`}
            className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{planContext.training_plans.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sesión #{planContext.session_number}
                {planContext.plan_phases ? ` · ${planContext.plan_phases.title}` : ''}
              </p>
            </div>
            {planContext.plan_phases?.color ? (
              <span className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: planContext.plan_phases.color }} />
            ) : (
              <span className="text-muted-foreground">›</span>
            )}
          </Link>
        </div>
      )}

      {/* ── META (objetivos / notas) — secondary, at the bottom ── */}
      {(session.objectives || session.notes) && (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">Detalles</h2>
          <div className="bg-card border border-border rounded-2xl shadow-sm divide-y divide-border">
            {session.objectives ? (
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground mb-1">Objetivos</p>
                <p className="text-sm text-foreground whitespace-pre-line">{session.objectives}</p>
              </div>
            ) : null}
            {session.notes ? (
              <div className="px-5 py-4">
                <p className="text-xs text-muted-foreground mb-1">Notas</p>
                <p className="text-sm text-foreground whitespace-pre-line">{session.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── DELETE ── */}
      <div className="pt-2">
        <DeleteSessionButton id={id} title={session.title} seriesId={session.series_id} />
      </div>

    </main>
  )
}
