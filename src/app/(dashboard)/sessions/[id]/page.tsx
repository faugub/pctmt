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
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
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

  const { data: sessionPlayers } = await supabase
    .from('session_players')
    .select('player_id, attended, players(full_name)')
    .eq('session_id', id) as { data: SessionPlayer[] | null }

  const { data: rawSessionBlocks } = await supabase
    .from('session_blocks')
    .select('id, sort_order, completed, duration_override, training_blocks(title, block_type, duration_min)')
    .eq('session_id', id)
    .order('sort_order', { ascending: true }) as { data: RawSessionBlock[] | null }

  const { data: library } = await supabase
    .from('training_blocks')
    .select('id, title, block_type, duration_min')
    .order('created_at', { ascending: false }) as { data: LibraryBlock[] | null }

  const sessionBlocks: SessionBlockRow[] = (rawSessionBlocks ?? [])
    .filter((r) => r.training_blocks !== null)
    .map((r) => ({
      id: r.id,
      title: r.training_blocks!.title,
      block_type: r.training_blocks!.block_type,
      duration_min: r.duration_override ?? r.training_blocks!.duration_min,
      completed: r.completed,
      sort_order: r.sort_order,
    }))

  const attended = sessionPlayers?.filter((sp) => sp.attended).length ?? 0
  const total = sessionPlayers?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/sessions" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Sesiones
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{session.title}</h1>
            <p className="text-sm text-gray-500 mt-1 capitalize">{formatDate(session.session_date)}</p>
          </div>
          <Link
            href={`/sessions/${id}/edit`}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 transition-colors flex-shrink-0"
          >
            Editar
          </Link>
        </div>

        {/* Meta */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
          {[
            { label: 'Tipo', value: session.session_type ? (TYPE_LABEL[session.session_type] ?? session.session_type) : '—' },
            { label: 'Duración', value: session.duration_min ? `${session.duration_min} min` : '—' },
            { label: 'Objetivos', value: session.objectives || '—' },
            { label: 'Notas', value: session.notes || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start px-5 py-4 gap-4">
              <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
              <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* Blocks */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Bloques de la sesión</h2>
          <SessionBlocksPanel sessionId={id} initialBlocks={sessionBlocks} library={library ?? []} />
        </div>

        {/* Attendance */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Asistencia</h2>
            {total > 0 && (
              <span className="text-sm text-gray-500">{attended}/{total} presentes</span>
            )}
          </div>

          {sessionPlayers && sessionPlayers.length > 0 ? (
            <div className="space-y-2">
              {sessionPlayers.map((sp) => (
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
            <p className="text-sm text-gray-400 text-center py-6 bg-white border border-gray-100 rounded-2xl">
              No hay jugadores en esta sesión.
            </p>
          )}
        </div>

        {/* Delete */}
        <div className="pt-2">
          <DeleteSessionButton id={id} title={session.title} seriesId={session.series_id} />
        </div>

      </main>
    </div>
  )
}
