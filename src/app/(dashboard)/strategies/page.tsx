import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'
import { CONCEPT_TAGS } from '@/lib/taxonomy'

const ZONE_LABEL: Record<string, string> = {
  red:      'Red',
  midcourt: 'Mediocampo',
  back:     'Fondo',
  full:     'Campo completo',
}

const ZONE_ORDER = ['red', 'midcourt', 'back', 'full']

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string; concept?: string }>
}) {
  const { zone, concept } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('strategies')
    .select('id, title, court_zone, tags, concept_tags')
    .order('created_at', { ascending: false })

  if (zone) query = query.eq('court_zone', zone)
  if (concept) query = query.contains('concept_tags', [concept])

  const { data: strategies, error } = await query
  if (error) throw new Error(error.message)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Estrategias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{strategies?.length ?? 0} en la biblioteca</p>
        </div>
        <Link
          href="/strategies/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva
        </Link>
      </div>

      {/* Zone filter */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <Link
          href={concept ? `/strategies?concept=${encodeURIComponent(concept)}` : '/strategies'}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !zone ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          Todas las zonas
        </Link>
        {ZONE_ORDER.map((z) => (
          <Link
            key={z}
            href={`/strategies?zone=${z}${concept ? `&concept=${encodeURIComponent(concept)}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              zone === z ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {ZONE_LABEL[z]}
          </Link>
        ))}
      </div>

      {/* Concept filter — "¿cuánto venimos trabajando paralelo?" */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <Link
          href={zone ? `/strategies?zone=${zone}` : '/strategies'}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !concept ? 'bg-amber-600 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          Todos los conceptos
        </Link>
        {CONCEPT_TAGS.map((c) => (
          <Link
            key={c}
            href={`/strategies?concept=${encodeURIComponent(c)}${zone ? `&zone=${zone}` : ''}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              concept === c ? 'bg-amber-600 text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      {strategies && strategies.length > 0 ? (
        <ul className="space-y-2">
          {strategies.map((s) => (
            <li key={s.id}>
              <Link
                href={`/strategies/${s.id}`}
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {s.court_zone && (
                      <span className="text-xs text-muted-foreground">{ZONE_LABEL[s.court_zone] ?? s.court_zone}</span>
                    )}
                    {s.concept_tags && (s.concept_tags as string[]).length > 0 && (
                      <>
                        {s.court_zone && <span className="text-border">·</span>}
                        {(s.concept_tags as string[]).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                    {s.tags && s.tags.length > 0 && (
                      <>
                        {(s.court_zone || (s.concept_tags as string[])?.length) && <span className="text-border">·</span>}
                        {(s.tags as string[]).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="🧠"
          title={
            concept ? `No hay estrategias con "${concept}".`
            : zone ? `No hay estrategias en ${ZONE_LABEL[zone] ?? zone}.`
            : 'La biblioteca está vacía.'
          }
          action={{ href: '/strategies/new', label: 'Añade la primera' }}
        />
      )}
    </main>
  )
}
