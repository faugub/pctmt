import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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

function formatMonthYear(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

// ── Types ────────────────────────────────────────────────────────────────────

type TrainingBlockRef = {
  title: string
  concept_tags: string[]
  decision_tags: string[]
}

type SessionBlockRef = {
  training_blocks: TrainingBlockRef | null
}

type SessionRef = {
  id: string
  title: string
  session_date: string
  session_type: string | null
  objectives: string | null
  notes: string | null
  session_blocks: SessionBlockRef[]
}

type SessionHistoryRow = {
  attended: boolean
  sessions: SessionRef | null
}

type SnapshotRow = {
  id: string
  recorded_at: string
  endurance_score: number | null
  speed_score: number | null
  strength_score: number | null
  technique_score: number | null
  notes: string | null
}

type TimelineEvent =
  | { kind: 'session';  date: string; session: SessionRef;  attended: boolean }
  | { kind: 'snapshot'; date: string; snapshot: SnapshotRow }

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TrajectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: player, error } = await supabase
    .from('players')
    .select('id, full_name')
    .eq('id', id)
    .single()

  if (error || !player) notFound()

  // One nested query — session_players → sessions → session_blocks → training_blocks
  const { data: sessionHistory } = await supabase
    .from('session_players')
    .select(`
      attended,
      sessions (
        id, title, session_date, session_type, objectives, notes,
        session_blocks (
          training_blocks (
            title, concept_tags, decision_tags
          )
        )
      )
    `)
    .eq('player_id', id) as { data: SessionHistoryRow[] | null }

  const { data: snapshots } = await supabase
    .from('player_snapshots')
    .select('id, recorded_at, endurance_score, speed_score, strength_score, technique_score, notes')
    .eq('player_id', id) as { data: SnapshotRow[] | null }

  // ── Build unified timeline ────────────────────────────────────────────────

  const events: TimelineEvent[] = []

  for (const row of sessionHistory ?? []) {
    if (!row.sessions) continue
    events.push({ kind: 'session', date: row.sessions.session_date, session: row.sessions, attended: row.attended })
  }

  for (const snap of snapshots ?? []) {
    events.push({ kind: 'snapshot', date: snap.recorded_at, snapshot: snap })
  }

  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // ── Aggregate stats ───────────────────────────────────────────────────────

  const sessionEvents = events.filter(
    (e): e is Extract<TimelineEvent, { kind: 'session' }> => e.kind === 'session'
  )
  const attendedEvents = sessionEvents.filter(e => e.attended)
  const attendanceRate = sessionEvents.length > 0
    ? Math.round((attendedEvents.length / sessionEvents.length) * 100)
    : null

  // Concept frequency — only from attended sessions
  const conceptFreq: Record<string, number> = {}
  for (const ev of attendedEvents) {
    for (const sb of ev.session.session_blocks ?? []) {
      for (const tag of sb.training_blocks?.concept_tags ?? []) {
        conceptFreq[tag] = (conceptFreq[tag] ?? 0) + 1
      }
    }
  }
  const topConcepts = Object.entries(conceptFreq).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Date range
  const timestamps = events.map(e => new Date(e.date).getTime())
  const earliest = timestamps.length > 0 ? new Date(Math.min(...timestamps)).toISOString() : null
  const latest   = timestamps.length > 0 ? new Date(Math.max(...timestamps)).toISOString() : null

  return (
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

      <Link href={`/players/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {player.full_name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Trayectoria</h1>
        {earliest && latest && earliest !== latest && (
          <p className="text-sm text-muted-foreground mt-1">
            {formatMonthYear(earliest)} – {formatMonthYear(latest)}
          </p>
        )}
      </div>

      {/* Summary chips */}
      {sessionEvents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-full">
            {sessionEvents.length} sesiones
          </span>
          {attendanceRate !== null && (
            <span className={`px-3 py-1.5 text-sm rounded-full ${
              attendanceRate >= 80 ? 'bg-green-100 text-green-700'
              : attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-600'
            }`}>
              {attendanceRate}% asistencia
            </span>
          )}
          {topConcepts.slice(0, 3).map(([tag, count]) => (
            <span key={tag} className="px-3 py-1.5 bg-amber-100 text-amber-800 text-sm rounded-full">
              {tag} ×{count}
            </span>
          ))}
        </div>
      )}

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Sin historial todavía. Las sesiones y snapshots aparecerán aquí a medida que se registren.
        </div>
      ) : (
        <div className="relative pl-10">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />

          <ul className="space-y-5">
            {events.map((ev, i) => {
              if (ev.kind === 'session') {
                const concepts = Array.from(new Set(
                  (ev.session.session_blocks ?? []).flatMap(sb => sb.training_blocks?.concept_tags ?? [])
                ))
                const decisions = Array.from(new Set(
                  (ev.session.session_blocks ?? []).flatMap(sb => sb.training_blocks?.decision_tags ?? [])
                ))

                return (
                  <li key={i} className="relative">
                    {/* Dot */}
                    <div className={`absolute -left-7 top-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold ${
                      ev.attended
                        ? 'bg-card border-primary text-primary'
                        : 'bg-card border-border text-muted-foreground'
                    }`}>
                      {ev.attended ? '✓' : '–'}
                    </div>

                    <Link
                      href={`/sessions/${ev.session.id}`}
                      className="block bg-card border border-border rounded-2xl shadow-sm px-4 py-3 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{ev.session.title}</p>
                        {ev.session.session_type && (
                          <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full flex-shrink-0">
                            {TYPE_LABEL[ev.session.session_type] ?? ev.session.session_type}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(ev.session.session_date)}</p>

                      {ev.session.objectives && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{ev.session.objectives}</p>
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

                      {!ev.attended && (
                        <p className="mt-2 text-xs text-muted-foreground">No asistió</p>
                      )}
                    </Link>
                  </li>
                )
              }

              // Snapshot
              const s = ev.snapshot
              const scores = [s.endurance_score, s.speed_score, s.strength_score, s.technique_score]
                .filter((v): v is number => v !== null)
              const avg = scores.length > 0
                ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
                : null

              return (
                <li key={i} className="relative">
                  <div className="absolute -left-7 top-3.5 w-4 h-4 rounded-full border-2 bg-sky-100 border-sky-400 flex items-center justify-center text-[9px]">
                    ◆
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl shadow-sm px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">Snapshot físico</p>
                      {avg && (
                        <span className="text-xs px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full">media {avg}/10</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(s.recorded_at)}</p>
                    {s.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.notes}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </main>
  )
}
