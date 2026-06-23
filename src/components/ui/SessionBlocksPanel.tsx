'use client'

import { useState, useTransition } from 'react'
import {
  addBlockToSession,
  removeSessionBlock,
  reorderSessionBlock,
  toggleSessionBlockCompleted,
} from '@/app/actions/sessionBlocks'

const TYPE_LABEL: Record<string, string> = {
  warmup: 'Calentamiento',
  technique: 'Técnica',
  physical: 'Físico',
  tactical: 'Táctico',
  match: 'Partido',
  cooldown: 'Vuelta a la calma',
}

const TYPE_COLOR: Record<string, string> = {
  warmup: '#f59e0b',
  technique: '#3b82f6',
  physical: '#10b981',
  tactical: '#8b5cf6',
  match: '#ef4444',
  cooldown: '#6b7280',
}

const TYPE_ORDER = ['warmup', 'technique', 'physical', 'tactical', 'match', 'cooldown']

export type SessionBlockRow = {
  id: string
  title: string
  block_type: string
  duration_min: number | null
  completed: boolean
  sort_order: number
}

export type LibraryBlock = {
  id: string
  title: string
  block_type: string
  duration_min: number | null
}

export function SessionBlocksPanel({
  sessionId,
  initialBlocks,
  library,
}: {
  sessionId: string
  initialBlocks: SessionBlockRow[]
  library: LibraryBlock[]
}) {
  const [blocks, setBlocks] = useState<SessionBlockRow[]>(
    [...initialBlocks].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const totalMinutes = blocks.reduce((sum, b) => sum + (b.duration_min ?? 0), 0)
  const doneCount = blocks.filter((b) => b.completed).length

  function handleToggle(row: SessionBlockRow) {
    const next = !row.completed
    setBlocks((prev) => prev.map((b) => (b.id === row.id ? { ...b, completed: next } : b)))
    startTransition(async () => {
      await toggleSessionBlockCompleted(row.id, next)
    })
  }

  function handleRemove(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    startTransition(async () => {
      await removeSessionBlock(id)
    })
  }

  function handleAdd(libBlock: LibraryBlock) {
    const tempId = `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const nextOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.sort_order)) + 1 : 0
    const optimisticRow: SessionBlockRow = {
      id: tempId,
      title: libBlock.title,
      block_type: libBlock.block_type,
      duration_min: libBlock.duration_min,
      completed: false,
      sort_order: nextOrder,
    }
    setBlocks((prev) => [...prev, optimisticRow])

    startTransition(async () => {
      const result = await addBlockToSession(sessionId, libBlock.id)
      if (result.ok) {
        setBlocks((prev) =>
          prev.map((b) => (b.id === tempId ? { ...b, id: result.id, sort_order: result.sortOrder } : b))
        )
      } else {
        setBlocks((prev) => prev.filter((b) => b.id !== tempId))
      }
    })
  }

  function handleMove(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= blocks.length) return

    const a = blocks[index]
    const b = blocks[targetIndex]
    const next = [...blocks]
    next[index] = { ...b, sort_order: a.sort_order }
    next[targetIndex] = { ...a, sort_order: b.sort_order }
    next.sort((x, y) => x.sort_order - y.sort_order)
    setBlocks(next)

    startTransition(async () => {
      await reorderSessionBlock(a.id, b.sort_order)
      await reorderSessionBlock(b.id, a.sort_order)
    })
  }

  const filteredLibrary = library.filter((b) => !typeFilter || b.block_type === typeFilter)

  return (
    <div className="space-y-3">
      {blocks.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>{doneCount}/{blocks.length} completados</span>
          <span>{totalMinutes} min en total</span>
        </div>
      )}

      {blocks.length > 0 ? (
        <ul className="space-y-2">
          {blocks.map((row, index) => (
            <li
              key={row.id}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors ${
                row.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 shadow-sm'
              }`}
            >
              <button
                onClick={() => handleToggle(row)}
                aria-label="Marcar como completado"
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-colors ${
                  row.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent'
                }`}
              >
                ✓
              </button>

              <button onClick={() => handleToggle(row)} className="flex-1 text-left min-w-0">
                <p className={`text-sm font-medium truncate ${row.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {row.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: TYPE_COLOR[row.block_type] ?? '#9ca3af' }}
                  />
                  <span className="text-xs text-gray-400">
                    {TYPE_LABEL[row.block_type] ?? row.block_type}
                    {row.duration_min ? ` · ${row.duration_min} min` : ''}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Subir"
                  className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-25 transition-colors"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === blocks.length - 1}
                  aria-label="Bajar"
                  className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-25 transition-colors"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemove(row.id)}
                  aria-label="Quitar"
                  className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6 bg-white border border-gray-100 rounded-2xl">
          Sin bloques todavía.
        </p>
      )}

      {pickerOpen ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setTypeFilter(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !typeFilter ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              Todos
            </button>
            {TYPE_ORDER.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === t ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          {filteredLibrary.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {filteredLibrary.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleAdd(b)}
                  className="text-left px-3 py-3 bg-white border border-gray-200 rounded-xl hover:border-gray-400 active:scale-95 transition-all"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block mb-1.5"
                    style={{ backgroundColor: TYPE_COLOR[b.block_type] ?? '#9ca3af' }}
                  />
                  <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                  <p className="text-xs text-gray-400">{b.duration_min ? `${b.duration_min} min` : '—'}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              {library.length === 0 ? (
                <>Tu biblioteca está vacía. <a href="/blocks/new" className="underline text-gray-600">Crea un bloque</a></>
              ) : (
                'Sin bloques de este tipo.'
              )}
            </p>
          )}

          <button
            onClick={() => setPickerOpen(false)}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Listo
          </button>
        </div>
      ) : (
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
        >
          + Añadir bloque
        </button>
      )}
    </div>
  )
}
