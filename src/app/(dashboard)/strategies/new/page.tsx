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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/strategies" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Estrategias
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Nueva estrategia</h1>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <StrategyForm action={createStrategy} submitLabel="Crear estrategia" />
        </div>
      </main>
    </div>
  )
}
