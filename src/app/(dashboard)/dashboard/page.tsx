import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coach } = await supabase
    .from('coaches').select('full_name, plan').eq('id', user.id).single()

  const displayName = coach?.full_name ?? user.email

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900 tracking-tight">pctmt</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{displayName}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Hola, {displayName} 👋</h1>
        <p className="text-sm text-gray-500 mb-10">
          Plan: <span className="font-medium text-gray-700 capitalize">{coach?.plan ?? 'free'}</span>
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Jugadores', href: '/players', emoji: '🎾' },
            { label: 'Sesiones', href: '/sessions', emoji: '📋' },
            { label: 'Torneos', href: '/tournaments', emoji: '🏆' },
            { label: 'Estrategias', href: '/strategies', emoji: '🧠' },
          ].map(({ label, href, emoji }) => (
            <a key={href} href={href}
              className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <span className="text-3xl">{emoji}</span>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </a>
          ))}
        </div>
      </main>
    </div>
  )
}