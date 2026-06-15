'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

type Snapshot = {
  recorded_at: string
  endurance_score: number | null
  speed_score: number | null
  strength_score: number | null
  technique_score: number | null
}

type Props = {
  snapshots: Snapshot[]
  playerName: string
}

const LINES = [
  { key: 'endurance_score', label: 'Resistencia', color: '#3b82f6' },
  { key: 'speed_score',     label: 'Velocidad',   color: '#10b981' },
  { key: 'strength_score',  label: 'Fuerza',      color: '#f59e0b' },
  { key: 'technique_score', label: 'T\u00e9cnica',     color: '#8b5cf6' },
] as const

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

export function ProgressChart({ snapshots, playerName }: Props) {
  const data = [...snapshots]
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
    .map((s) => ({
      date: formatDate(s.recorded_at),
      endurance_score: s.endurance_score,
      speed_score: s.speed_score,
      strength_score: s.strength_score,
      technique_score: s.technique_score,
    }))

  return (
    <div>
      <p className="text-xs text-gray-400 mb-4">Progreso de {playerName}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          {LINES.map(({ key, label, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={label}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
