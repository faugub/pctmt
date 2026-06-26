import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SessionForm } from '@/components/ui/SessionForm'
import { createSession } from '@/app/actions/sessions'

export default async function NewSessionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .order('full_name')

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/sessions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Sesiones
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Nueva sesión</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <SessionForm action={createSession} players={players ?? []} draftKey="new" />
      </div>
    </main>
  )
}
