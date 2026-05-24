import { Maximize2, Volume2, VolumeX } from 'lucide-react'
import type { Camera } from '@/types/camera'
import { LiveStream } from '@/components/camera/LiveStream'
import { useState } from 'react'

export function LiveViewPanel({ camera }: { camera: Camera }) {
  const [muted, setMuted] = useState(true)

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)]">
      <LiveStream camera={camera} />
      <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2">
        <span className="text-xs text-slate-500">
          {camera.model} · {camera.host} · {camera.streamProfile}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white"
            aria-label={muted ? 'Ljud av' : 'Ljud på'}
            title="Ljud kopplas senare (RTSP)"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50 hover:text-white"
            aria-label="Helskärm"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
