'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  saveBoardData,
  type BoardData,
  type BoardLine,
  type BoardToken,
  type LineStyle,
  type LineColor,
} from '@/app/actions/boards'

// Court viewBox — 1:2 ratio (10m × 20m at 18 px/m). Coordinates stored as
// percentages so the diagram renders identically on any screen size.
const VIEW_W = 200
const VIEW_H = 400
const COURT_X = 10
const COURT_Y = 20
const COURT_W = 180
const COURT_H = 360
// FIP: service line sits 3.05 m from the back wall (≈ 54.9 px at 18 px/m).
const SERVICE_LINE_DEPTH = 54.9

const TEAM_COLOR: Record<BoardToken['team'], string> = {
  own:   '#2563eb',
  rival: '#dc2626',
  ball:  '#eab308',
}

const COLOR_HEX: Record<LineColor, string> = {
  white:  '#ffffff',
  yellow: '#fbbf24',
  cyan:   '#67e8f9',
}

type Tool = 'move' | LineStyle

const TOOLS: { id: Tool; symbol: string; label: string }[] = [
  { id: 'move',         symbol: '↖', label: 'Mover'   },
  { id: 'arrow',        symbol: '→', label: 'Flecha'  },
  { id: 'dashed-arrow', symbol: '⇢', label: 'Movim.'  },
  { id: 'line',         symbol: '—', label: 'Línea'   },
  { id: 'dashed',       symbol: '╌', label: 'Punt.'   },
  { id: 'curve',        symbol: '⌒', label: 'Curva'   },
]

const LINE_COLORS: { id: LineColor; label: string }[] = [
  { id: 'white',  label: 'Blanco'   },
  { id: 'yellow', label: 'Amarillo' },
  { id: 'cyan',   label: 'Cyan'     },
]

// ── helpers ──────────────────────────────────────────────────────────────────

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

/** Backward compat: old lines stored only dashed:boolean */
function effectiveStyle(line: BoardLine): LineStyle {
  if (line.style) return line.style
  return line.dashed ? 'dashed-arrow' : 'arrow'
}

function effectiveColor(line: BoardLine): LineColor {
  return line.color ?? 'white'
}

/**
 * Quadratic bezier control point — offset perpendicular to the segment
 * by 30% of its length. Produces a gentle, consistent arc.
 */
function curveControl(x1: number, y1: number, x2: number, y2: number) {
  return {
    cx: (x1 + x2) / 2 - (y2 - y1) * 0.3,
    cy: (y1 + y2) / 2 + (x2 - x1) * 0.3,
  }
}

// ── component ────────────────────────────────────────────────────────────────

export function TacticBoardEditor({
  boardId,
  initialData,
}: {
  boardId: string
  initialData: BoardData
}) {
  const [tokens,      setTokens]      = useState<BoardToken[]>(initialData.tokens ?? [])
  const [lines,       setLines]       = useState<BoardLine[]>(initialData.lines   ?? [])
  const [selected,    setSelected]    = useState<{ type: 'token' | 'line'; id: string } | null>(null)
  const [activeTool,  setActiveTool]  = useState<Tool>('move')
  const [lineColor,   setLineColor]   = useState<LineColor>('white')
  const [drawingLine, setDrawingLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [dragTokenId, setDragTokenId] = useState<string | null>(null)
  const [saveStatus,  setSaveStatus]  = useState<'idle' | 'saving' | 'saved'>('idle')

  const svgRef         = useRef<SVGSVGElement>(null)
  const hasMountedRef  = useRef(false)
  const [, startTransition] = useTransition()

  const isDrawingMode = activeTool !== 'move'

  // ── autosave ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return }
    setSaveStatus('saving')
    const t = setTimeout(() => {
      startTransition(async () => {
        const result = await saveBoardData(boardId, { tokens, lines })
        setSaveStatus(result.ok ? 'saved' : 'idle')
      })
    }, 700)
    return () => clearTimeout(t)
  }, [tokens, lines, boardId])

  // ── pointer helpers ───────────────────────────────────────────────────────
  function getPoint(e: { clientX: number; clientY: number }) {
    const svg  = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left)  / rect.width)  * VIEW_W,
      y: ((e.clientY - rect.top)   / rect.height) * VIEW_H,
    }
  }

  // ── token actions ─────────────────────────────────────────────────────────
  function addToken(team: BoardToken['team']) {
    const same   = tokens.filter(t => t.team === team)
    const label  = team === 'ball' ? '●' : String(same.length + 1)
    const defaultY = team === 'rival' ? 22 : team === 'ball' ? 50 : 78
    const token: BoardToken = {
      id: newId(),
      x: clamp(35 + same.length * 8, 10, 90),
      y: defaultY,
      team,
      label,
    }
    setTokens(prev => [...prev, token])
    setSelected({ type: 'token', id: token.id })
  }

  // ── shared actions ────────────────────────────────────────────────────────
  function deleteSelected() {
    if (!selected) return
    if (selected.type === 'token') setTokens(prev => prev.filter(t => t.id !== selected.id))
    else                           setLines(prev  => prev.filter(l => l.id !== selected.id))
    setSelected(null)
  }

  function clearAll() {
    if (tokens.length === 0 && lines.length === 0) return
    if (!confirm('¿Borrar todo el contenido de esta pizarra?')) return
    setTokens([]); setLines([]); setSelected(null)
  }

  // ── canvas events ─────────────────────────────────────────────────────────
  function handleSvgPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDrawingMode) { setSelected(null); return }
    const { x, y } = getPoint(e)
    svgRef.current?.setPointerCapture(e.pointerId)
    setDrawingLine({ x1: x, y1: y, x2: x, y2: y })
  }

  function handleSvgPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const { x, y } = getPoint(e)
    if (dragTokenId) {
      const pct = courtToPercent(x, y)
      setTokens(prev => prev.map(t => t.id === dragTokenId ? { ...t, x: pct.x, y: pct.y } : t))
      return
    }
    if (drawingLine) setDrawingLine(prev => prev ? { ...prev, x2: x, y2: y } : null)
  }

  function handleSvgPointerUp() {
    if (dragTokenId) { setDragTokenId(null); return }
    if (drawingLine) {
      const { x1, y1, x2, y2 } = drawingLine
      if (Math.hypot(x2 - x1, y2 - y1) > 6) {
        const p1 = courtToPercent(x1, y1)
        const p2 = courtToPercent(x2, y2)
        const line: BoardLine = {
          id: newId(),
          x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
          dashed: false,                  // compat field
          style:  activeTool as LineStyle,
          color:  lineColor,
        }
        setLines(prev => [...prev, line])
        setSelected({ type: 'line', id: line.id })
      }
      setDrawingLine(null)
    }
  }

  // ── line renderer ─────────────────────────────────────────────────────────
  function renderSavedLine(line: BoardLine) {
    const style      = effectiveStyle(line)
    const color      = effectiveColor(line)
    const isSelected = selected?.type === 'line' && selected.id === line.id
    const stroke     = isSelected ? '#fbbf24' : COLOR_HEX[color]
    const strokeW    = isSelected ? 3 : 2.25
    const markerId   = isSelected ? 'arrowhead-selected' : `arrowhead-${color}`
    const hasArrow   = style === 'arrow' || style === 'dashed-arrow' || style === 'curve'
    const dashed     = style === 'dashed-arrow' || style === 'dashed'
    const p1         = percentToCourt(line.x1, line.y1)
    const p2         = percentToCourt(line.x2, line.y2)

    const onTap = (e: React.PointerEvent) => {
      e.stopPropagation()
      setSelected({ type: 'line', id: line.id })
    }

    if (style === 'curve') {
      const { cx, cy } = curveControl(p1.px, p1.py, p2.px, p2.py)
      const d = `M ${p1.px},${p1.py} Q ${cx},${cy} ${p2.px},${p2.py}`
      return (
        <g key={line.id} onPointerDown={onTap}>
          <path d={d} stroke="transparent" strokeWidth={16} fill="none" />
          <path d={d} stroke={stroke} strokeWidth={strokeW} fill="none"
            markerEnd={hasArrow ? `url(#${markerId})` : undefined} />
        </g>
      )
    }

    return (
      <g key={line.id} onPointerDown={onTap}>
        <line x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
          stroke="transparent" strokeWidth={16} />
        <line x1={p1.px} y1={p1.py} x2={p2.px} y2={p2.py}
          stroke={stroke} strokeWidth={strokeW}
          strokeDasharray={dashed ? '6 4' : undefined}
          markerEnd={hasArrow ? `url(#${markerId})` : undefined}
        />
      </g>
    )
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">

      {/* Row 1: Tokens */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => addToken('own')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors">
          + Mi jugador
        </button>
        <button onClick={() => addToken('rival')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 border border-red-100 hover:bg-red-100 transition-colors">
          + Rival
        </button>
        <button onClick={() => addToken('ball')}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100 transition-colors">
          + Pelota
        </button>
      </div>

      {/* Row 2: Drawing tools */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
            className={`flex flex-col items-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 ${
              activeTool === tool.id
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:border-foreground/40'
            }`}
          >
            <span className="text-base leading-none">{tool.symbol}</span>
            <span className="mt-0.5 text-[9px] opacity-70">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Row 3: Color picker (line tools) + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {isDrawingMode && (
          <>
            <span className="text-xs text-muted-foreground">Color:</span>
            {LINE_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setLineColor(c.id)}
                title={c.label}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  lineColor === c.id ? 'scale-125 border-foreground' : 'border-border'
                }`}
                style={{ backgroundColor: COLOR_HEX[c.id] }}
              />
            ))}
            <span className="w-px h-4 bg-border mx-1" />
          </>
        )}
        <button
          onClick={deleteSelected}
          disabled={!selected}
          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border text-foreground hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
        >
          × Eliminar
        </button>
        <button
          onClick={clearAll}
          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:border-red-300 hover:text-red-500 transition-colors"
        >
          🧹 Limpiar
        </button>
        <span className="ml-auto text-xs text-muted-foreground">
          {saveStatus === 'saving' && 'Guardando…'}
          {saveStatus === 'saved'  && '✓ Guardado'}
        </span>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground">
        {isDrawingMode
          ? 'Deslizá sobre la cancha para dibujar.'
          : 'Arrastrá las fichas · tocá una línea para seleccionarla.'}
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
            {(['white', 'yellow', 'cyan'] as LineColor[]).map(c => (
              <marker key={c} id={`arrowhead-${c}`}
                markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill={COLOR_HEX[c]} />
              </marker>
            ))}
            <marker id="arrowhead-selected"
              markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#fbbf24" />
            </marker>
          </defs>

          {/* Background */}
          <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#0f4c5c" />
          <rect x={COURT_X} y={COURT_Y} width={COURT_W} height={COURT_H} fill="#1a7a8c" />
          <rect x={COURT_X} y={COURT_Y} width={COURT_W} height={COURT_H}
            fill="none" stroke="#bff3ff" strokeOpacity={0.5} strokeWidth={3} />

          {/* Net */}
          <line x1={COURT_X} y1={COURT_Y + COURT_H / 2}
            x2={COURT_X + COURT_W} y2={COURT_Y + COURT_H / 2}
            stroke="#0f172a" strokeWidth={3} />

          {/* Service lines */}
          <line x1={COURT_X} y1={COURT_Y + SERVICE_LINE_DEPTH}
            x2={COURT_X + COURT_W} y2={COURT_Y + SERVICE_LINE_DEPTH}
            stroke="white" strokeOpacity={0.6} strokeWidth={1.5} />
          <line x1={COURT_X} y1={COURT_Y + COURT_H - SERVICE_LINE_DEPTH}
            x2={COURT_X + COURT_W} y2={COURT_Y + COURT_H - SERVICE_LINE_DEPTH}
            stroke="white" strokeOpacity={0.6} strokeWidth={1.5} />
          <line x1={COURT_X + COURT_W / 2} y1={COURT_Y + SERVICE_LINE_DEPTH}
            x2={COURT_X + COURT_W / 2} y2={COURT_Y + COURT_H - SERVICE_LINE_DEPTH}
            stroke="white" strokeOpacity={0.6} strokeWidth={1.5} />

          {/* Labels */}
          <text x={COURT_X + 6} y={COURT_Y + 16} fill="white" fillOpacity={0.5} fontSize={9}>Rival</text>
          <text x={COURT_X + 6} y={COURT_Y + COURT_H - 8} fill="white" fillOpacity={0.5} fontSize={9}>Tu equipo</text>

          {/* Saved lines */}
          {lines.map(line => renderSavedLine(line))}

          {/* Live preview */}
          {drawingLine && (() => {
            if (activeTool === 'curve') {
              const { cx, cy } = curveControl(
                drawingLine.x1, drawingLine.y1, drawingLine.x2, drawingLine.y2,
              )
              return (
                <path
                  d={`M ${drawingLine.x1},${drawingLine.y1} Q ${cx},${cy} ${drawingLine.x2},${drawingLine.y2}`}
                  stroke="#fbbf24" strokeWidth={2.25} strokeDasharray="4 4" fill="none"
                />
              )
            }
            return (
              <line
                x1={drawingLine.x1} y1={drawingLine.y1}
                x2={drawingLine.x2} y2={drawingLine.y2}
                stroke="#fbbf24" strokeWidth={2.25} strokeDasharray="4 4"
              />
            )
          })()}

          {/* Tokens */}
          {tokens.map(token => {
            const { px, py }   = percentToCourt(token.x, token.y)
            const isSelected   = selected?.type === 'token' && selected.id === token.id
            const radius       = token.team === 'ball' ? 6 : 10
            return (
              <g
                key={token.id}
                onPointerDown={(e) => {
                  e.stopPropagation()
                  svgRef.current?.setPointerCapture(e.pointerId)
                  setSelected({ type: 'token', id: token.id })
                  if (!isDrawingMode) setDragTokenId(token.id)
                }}
                style={{ cursor: isDrawingMode ? 'crosshair' : 'grab' }}
              >
                <circle cx={px} cy={py} r={radius}
                  fill={TEAM_COLOR[token.team]}
                  stroke={isSelected ? '#fbbf24' : 'white'}
                  strokeWidth={isSelected ? 3 : 1.5}
                />
                {token.team !== 'ball' && (
                  <text x={px} y={py + 3.5} textAnchor="middle"
                    fontSize={9} fontWeight={600} fill="white">
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
