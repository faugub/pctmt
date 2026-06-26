import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SessionForm } from '@/components/ui/SessionForm'
import { updateSession } from '@/app/actions/sessions'

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .order('full_name')

  const updateAction = updateSession.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/sessions/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {session.title}
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Editar sesión</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <SessionForm
          action={updateAction}
          players={players ?? []}
          defaultValues={{
            title: session.title,
            session_date: session.session_date,
            duration_min: session.duration_min,
            session_type: session.session_type,
            objectives: session.objectives,
            notes: session.notes,
          }}
          submitLabel="Guardar cambios"
          draftKey={id}
        />
      </div>
    </main>
  )
}
