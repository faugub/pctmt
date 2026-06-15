import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { deletePlayer } from '@/app/actions/players'

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciación',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  competition: 'Competición',
}

const HAND_LABEL: Record<string, string> = {
  right: 'Derecha',
  left: 'Izquierda',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function calcAge(dateStr: string | null) {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !player) notFound()

  const age = calcAge(player.birth_date)

  const deleteAction = deletePlayer.bind(null, id)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/players" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Jugadores
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{player.full_name}</h1>
            {player.level && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {LEVEL_LABEL[player.level] ?? player.level}
              </span>
            )}
          </div>
          <Link
            href={`/players/${id}/edit`}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 transition-colors"
          >
            Editar
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
          {[
            {
              label: 'Fecha de nacimiento',
              value: `${formatDate(player.birth_date)}${age !== null ? ` (${age} años)` : ''}`,
            },
            { label: 'Mano dominante', value: player.dominant_hand ? (HAND_LABEL[player.dominant_hand] ?? player.dominant_hand) : '—' },
            { label: 'Peso', value: player.weight_kg ? `${player.weight_kg} kg` : '—' },
            { label: 'Altura', value: player.height_cm ? `${player.height_cm} cm` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-5 py-4">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <form action={deleteAction}>
            <button
              type="submit"
              className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              onClick={(e) => {
                if (!confirm(`¿Eliminar a ${player.full_name}? Esta acción no se puede deshacer.`)) {
                  e.preventDefault()
                }
              }}
            >
              Eliminar jugador
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
