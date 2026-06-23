import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StrategyForm } from '@/components/ui/StrategyForm'
import { createStrategy } from '@/app/actions/strategies'

export default async function NewStrategyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/strategies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Estrategias
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Nueva estrategia</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <StrategyForm action={createStrategy} submitLabel="Crear estrategia" />
      </div>
    </main>
  )
}
