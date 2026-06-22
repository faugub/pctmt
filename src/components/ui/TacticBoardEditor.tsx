'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { saveBoardData, type BoardData, type BoardLine, type BoardToken } from '@/app/actions/boards'

// Court viewBox is a fixed 1:2 ratio (10m x 20m at 18px/m) so stored
// percentages render identically on any screen size.
const VIEW_W = 200
const VIEW_H = 400
const COURT_X = 10
const COURT_Y = 20
const COURT_W = 180
const COURT_H = 360

const TEAM_COLOR: Record<BoardToken['team'], string> = {
  own: '#2563eb',
  rival: '#dc2626',
  ball: '#eab308',
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function courtToPercent(px: number, py: number) {
  return {
    x: clamp(((px - COURT_X) / COURT_W) * 100, 0, 100),
    y: clamp(((py - COURT_Y) / COURT_H) * 100, 0, 100),
  }
}

function percentToCourt(x: number, y: number) {
  return {
    px: COURT_X + (x / 100) * COURT_W,
    py: COURT_Y + (y / 100) * COURT_H,
  }
}

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function TacticBoardEditor({
  boardId,
  initialData,
}: {
  boardId: string
  initialData: BoardData
}) {
  const [tokens, setTokens] = useState<BoardToken[]>(initialData.tokens ?? [])
  const [lines, setLines] = useState<BoardLine[]>(initialData.lines ?? [])
  const [selected, setSelected] = useState<{ type: 'token' | 'line'; id: string } | null>(null)
  const [lineMode, setLineMode] = useState(false)
  const [drawingLine, setDrawingLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [dragTokenId, setDragTokenId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const svgRef = useRef<SVGSVGElement>(null)
  const hasMountedRef = useRef(false)
  const [, startTransition] = useTransition()

  // Autosave: any change to tokens/lines schedules a save ~700ms later.
  // Skips the very first render, since that state is exactly what's
  // already in the database.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    setSaveStatus('saving')
    const timeout = setTimeout(() => {
      startTransition(async () => {
        const result = await saveBoardData(boardId, { tokens, lines })
        setSaveStatus(result.ok ? 'saved' : 'idle')
      })
    }, 700)
    return () => clearTimeout(timeout)
  }, [tokens, lines, boardId])

  function getPoint(e: { clientX: number; clientY: number }) {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
    }
  }

  function addToken(team: BoardToken['team']) {
    const sameTeam = tokens.filter((t) => t.team === team)
    const label = team === 'ball' ? '●' : String(sameTeam.length + 1)
    const defaultY = team === 'rival' ? 22 : team === 'ball' ? 50 : 78
    const jitter = sameTeam.length * 8
    const token: BoardToken = {
      id: newId(),
      x: clamp(35 + jitter, 10, 90),
      y: defaultY,
      team,
      label,
    }
    setTokens((prev) => [...prev, token])
    setSelected({ type: 'token', id: token.id })
  }

  function deleteSelected() {
    if (!selected) return
    if (selected.type === 'token') {
      setTokens((prev) => prev.filter((t) => t.id !== selected.id))
    } else {
      setLines((prev) => prev.filter((l) => l.id !== selected.id))
    }
    setSelected(null)
  }

  function clearAll() {
    if (tokens.length === 0 && lines.length === 0) return
    if (!confirm('¿Borrar todo el contenido de esta pizarra?')) return
    setTokens([])
    setLines([])
    setSelected(null)
  }

  function handleSvgPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!lineMode) {
      setSelected(null)
      return
    }
    const { x, y } = getPoint(e)
    svgRef.current?.setPointerCapture(e.pointerId)
    setDrawingLine({ x1: x, y1: y, x2: x, y2: y })
  }

  function handleSvgPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const { x, y } = getPoint(e)

    if (dragTokenId) {
      const pct = courtToPercent(x, y)
      setTokens((prev) =>
        prev.map((t) => (t.id === dragTokenId ? { ...t, x: pct.x, y: pct.y } : t))
      )
      return
    }

    if (drawingLine) {
      setDrawingLine((prev) => (prev ? { ...prev, x2: x, y2: y } : null))
    }
  }

  function handleSvgPointerUp() {
    if (dragTokenId) {
      setDragTokenId(null)
    }
    if (drawingLine) {
      const { x1, y1, x2, y2 } = drawingLine
      const dist = Math.hypot(x2 - x1, y2 - y1)
      if (dist > 6) {
        const p1 = courtToPercent(x1, y1)
        const p2 = courtToPercent(x2, y2)
        const line: BoardLine = { id: newId(), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, dashed: false }
        setLines((prev) => [...prev, line])
        setSelected({ type: 'line', id: line.id })
      }
      setDrawingLine(null)
    }
  }

  const previewLine = drawingLine

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => addToken('own')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          + Mi jugador
        </button>
        <button
          onClick={() => addToken('rival')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors"
        >
          + Rival
        </button>
        <button
          onClick={() => addToken('ball')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors"
        >
          + Pelota
        </button>

        <span className="w-px h-6 bg-gray-200 mx-1" />

        <button
          onClick={() => { setLineMode((v) => !v); setSelected(null) }}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
            lineMode
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
          }`}
        >
          ✏️ Modo línea {lineMode ? '(activo)' : ''}
        </button>

        <button
          onClick={deleteSelected}
          disabled={!selected}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-40 disabled:hover:border-gray-200"
        >
          Eliminar seleccionado
        </button>

        <button
          onClick={clearAll}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 transition-colors"
        >
          Limpiar todo
        </button>

        <span className="ml-auto text-xs text-gray-400">
          {saveStatus === 'saving' && 'Guardando…'}
          {saveStatus === 'saved' && 'Guardado ✓'}
        </span>
      </div>

      <p className="text-xs text-gray-400">
        Arrastra las fichas para moverlas. Con &quot;Modo línea&quot; activo, desliza sobre la cancha para dibujar una jugada.
      </p>

      {/* Court */}
      <div className="w-full max-w-sm mx-auto">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full touch-none select-none rounded-2xl shadow-sm"
          onPointerDown={handleSvgPointerDown}
          onPointerMove={handleSvgPointerMove}
          onPointerUp={handleSvgPointerUp}
          onPointerCancel={handleSvgPointerUp}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="white" />
            </marker>
            <marker id="arrowheadSelected" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Outer background */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#0f4c5c" />

          {/* Court surface */}
          <rect x={COURT_X} y={COURT_Y} width={COURT_W} height={COURT_H} fill="#1a7a8c" />

          {/* Glass walls (visual cue only) */}
          <rect
            x={COURT_X}
            y={COURT_Y}
            width={COURT_W}
            height={COURT_H}
            fill="none"
            stroke="#bff3ff"
            strokeOpacity={0.5}
            strokeWidth={3}
          />

          {/* Net */}
          <line
            x1={COURT_X} y1={COURT_Y + COURT_H / 2}
            x2={COURT_X + COURT_W} y2={COURT_Y + COURT_H / 2}
            stroke="#0f172a" strokeWidth={3}
          />

          {/* Service lines (3m from net) */}
          <line
            x1={COURT_X} y1={COURT_Y + COURT_H / 2 - 54}
            x2={COURT_X + COURT_W} y2={COURT_Y + COURT_H / 2 - 54}
            stroke="white" strokeOpacity={0.6} strokeWidth={1.5}
          />
          <line
            x1={COURT_X} y1={COURT_Y + COURT_H / 2 + 54}
            x2={COURT_X + COURT_W} y2={COURT_Y + COURT_H / 2 + 54}
            stroke="white" strokeOpacity={0.6} strokeWidth={1.5}
          />

          {/* Center service line */}
          <line
            x1={COURT_X + COURT_W / 2} y1={COURT_Y + COURT_H / 2 - 54}
            x2={COURT_X + COURT_W / 2} y2={COURT_Y + COURT_H / 2 + 54}
            stroke="white" strokeOpacity={0.6} strokeWidth={1.5}
          />

          {/* Half labels */}
          <text x={COURT_X + 6} y={COURT_Y + 16} fill="white" fillOpacity={0.5} fontSize={9}>Rival</text>
          <text x={COURT_X + 6} y={COURT_Y + COURT_H - 8} fill="white" fillOpacity={0.5} fontSize={9}>Tu equipo</text>

          {/* Saved lines */}
          {lines.map((line) => {
            const p1 = percentToCourt(line.x1, line.y1)
            const p2 = percentToCourt(line.x2, line.y2)
            const isSelected = selected?.type === 'line' && selected.id === line.id
            return (
              <g
                key={line.id}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  setSelected({ type: 'line', id: line.id })
                }}
              >
                <line x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py} stroke="transparent" strokeWidth={16} />
                <line
                  x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
                  stroke={isSelected ? '#fbbf24' : 'white'}
                  strokeWidth={isSelected ? 3 : 2.25}
                  strokeDasharray={line.dashed ? '6 4' : undefined}
                  markerEnd={isSelected ? 'url(#arrowheadSelected)' : 'url(#arrowhead)'}
                />
              </g>
            )
          })}

          {/* Live preview while drawing a line */}
          {previewLine && (
            <line
              x1={previewLine.x1} y1={previewLine.y1}
              x2={previewLine.x2} y2={previewLine.y2}
              stroke="#fbbf24" strokeWidth={2.25} strokeDasharray="4 4"
            />
          )}

          {/* Tokens */}
          {tokens.map((token) => {
            const { px, py } = percentToCourt(token.x, token.y)
            const isSelected = selected?.type === 'token' && selected.id === token.id
            const radius = token.team === 'ball' ? 6 : 10
            return (
              <g
                key={token.id}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  svgRef.current?.setPointerCapture(e.pointerId)
                  setSelected({ type: 'token', id: token.id })
                  setDragTokenId(token.id)
                }}
                style={{ cursor: 'grab' }}
              >
                <circle
                  cx={px} cy={py} r={radius}
                  fill={TEAM_COLOR[token.team]}
                  stroke={isSelected ? '#fbbf24' : 'white'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                {token.team !== 'ball' && (
                  <text
                    x={px} y={py + 3.5}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={600}
                    fill="white"
                  >
                    {token.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
