import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useState } from 'react'
import { formatDateTime } from '@/lib/format'

interface TimelineScrubberProps {
  cameraName: string
}

export function TimelineScrubber({ cameraName }: TimelineScrubberProps) {
  const [playing, setPlaying] = useState(false)
  const [position, setPosition] = useState(42)

  const now = new Date()
  const start = new Date(now)
  start.setHours(now.getHours() - 24)

  return (
    <div className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-4">
      <div className="mb-4 aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <p className="text-sm text-slate-500">Uppspelning · {cameraName} · mock</p>
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>{formatDateTime(start.toISOString())}</span>
        <span className="text-slate-300">{formatDateTime(now.toISOString())}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="timeline-slider mb-4 w-full"
        aria-label="Tidslinje"
      />

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50"
          aria-label="10 sekunder bakåt"
        >
          <SkipBack className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full bg-blue-600 p-3 text-white hover:bg-blue-500"
          aria-label={playing ? 'Pausa' : 'Spela'}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </button>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50"
          aria-label="10 sekunder framåt"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-slate-500">
        Hastighet: 1× · Segment-index kopplas till inspelningstjänst i Phase 1
      </p>
    </div>
  )
}
