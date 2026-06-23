import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BlockForm } from '@/components/ui/BlockForm'
import { createBlock } from '@/app/actions/blocks'

export default async function NewBlockPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: strategies } = await supabase
    .from('strategies')
    .select('id, title')
    .order('title', { ascending: true })

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/blocks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Bloques
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Nuevo bloque</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <BlockForm action={createBlock} strategies={strategies ?? []} submitLabel="Crear bloque" />
      </div>
    </main>
  )
}
