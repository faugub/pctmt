import Link from 'next/link'

const ITEMS = [
  { href: '/calendar',    emoji: '📅', label: 'Calendario',    desc: 'Vista mensual de sesiones' },
  { href: '/series',      emoji: '🔁', label: 'Series',         desc: 'Sesiones recurrentes' },
  { href: '/pairs',       emoji: '🤝', label: 'Parejas',        desc: 'Sociedades de jugadores' },
  { href: '/blocks',      emoji: '🏃', label: 'Bloques',        desc: 'Ejercicios y drills' },
  { href: '/strategies',  emoji: '🧠', label: 'Estrategias',    desc: 'Tácticas y sistemas de juego' },
  { href: '/boards',      emoji: '🎨', label: 'Pizarras',       desc: 'Diagramas de cancha' },
  { href: '/tournaments', emoji: '🏆', label: 'Torneos',        desc: 'Competencias y resultados' },
  { href: '/settings',    emoji: '⚙️', label: 'Configuración',  desc: 'Perfil y cuenta' },
]

export default function MorePage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-6">Más</h1>
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col gap-1.5 px-4 py-4 bg-card border border-border rounded-2xl hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-sm font-semibold text-foreground">{item.label}</span>
            <span className="text-xs text-muted-foreground leading-tight">{item.desc}</span>
          </Link>
        ))}
      </div>
    </main>
  )
}
