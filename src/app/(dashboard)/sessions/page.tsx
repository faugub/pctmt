import { redirect } from 'next/navigation'
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
    weekday: 'short', day: '2-digit', month: 'short',
  })
}

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, title, session_date, session_type, duration_min')
    .order('session_date', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sessions?.length ?? 0} registradas</p>
        </div>
        <Link
          href="/sessions/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva sesión
        </Link>
      </div>

      {sessions && sessions.length > 0 ? (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/sessions/${s.id}`}
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(s.session_date)}
                    {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
                    {s.duration_min ? ` · ${s.duration_min} min` : ''}
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-4">📋</p>
          <p className="text-sm">Todavía no hay sesiones.</p>
          <Link href="/sessions/new" className="text-sm text-foreground underline mt-2 inline-block">
            Crea la primera
          </Link>
        </div>
      )}
    </main>
  )
}
