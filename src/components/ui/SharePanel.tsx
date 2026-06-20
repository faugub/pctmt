'use client'

import { useState } from 'react'
import { enablePlayerShare, disablePlayerShare, regenerateShareToken } from '@/app/actions/sharing'

// TODO: move to NEXT_PUBLIC_SITE_URL env var once the domain is finalized.
const SITE_URL = 'https://pctmt-azure.vercel.app'

export function SharePanel({
  playerId,
  shareEnabled,
  shareToken,
}: {
  playerId: string
  shareEnabled: boolean
  shareToken: string
}) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${SITE_URL}/share/player/${shareToken}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = async () => {
    if (shareEnabled) {
      await disablePlayerShare(playerId)
    } else {
      await enablePlayerShare(playerId)
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('Esto invalidará el enlace anterior. ¿Continuar?')) return
    await regenerateShareToken(playerId)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-base font-semibold text-gray-900">Perfil compartible</h2>
        <button
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition-colors ${shareEnabled ? 'bg-gray-900' : 'bg-gray-200'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              shareEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Comparte el progreso de este jugador por WhatsApp. No necesita cuenta para verlo.
      </p>

      {shareEnabled && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              {copied ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>
          <button
            onClick={handleRegenerate}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline"
          >
            Generar un enlace nuevo (invalida el actual)
          </button>
        </div>
      )}
    </div>
  )
}
