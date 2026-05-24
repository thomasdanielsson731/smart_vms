import { Pause, Play, Radio, SkipBack, SkipForward } from 'lucide-react'
import { useState } from 'react'
import type { Camera } from '@/types/camera'
import type { ForensicIncident } from '@/types/forensic'
import { formatDateTime } from '@/lib/format'
import {
  isTimelineLive,
  LIVE_POSITION_THRESHOLD,
  positionFromIncident,
  timeAtPosition,
} from '@/lib/timeline-unified'

interface UnifiedTimelineScrubberProps {
  camera: Camera
  rangeStart: Date
  rangeEnd: Date
  position: number
  onPositionChange: (position: number) => void
  incidents?: ForensicIncident[]
  selectedIncidentId?: string | null
  onSelectIncident?: (id: string) => void
  liveVideo: React.ReactNode
  playbackLabel?: string
}

export function UnifiedTimelineScrubber({
  camera,
  rangeStart,
  rangeEnd,
  position,
  onPositionChange,
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
  liveVideo,
  playbackLabel,
}: UnifiedTimelineScrubberProps) {
  const [playing, setPlaying] = useState(false)
  const isLive = isTimelineLive(position)
  const scrubTime = isLive ? rangeEnd : timeAtPosition(position, rangeStart, rangeEnd)

  const handleIncidentClick = (inc: ForensicIncident) => {
    onSelectIncident?.(inc.id)
    onPositionChange(positionFromIncident(inc, rangeStart, rangeEnd))
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-4">
      <div className="relative overflow-hidden rounded-lg bg-black">
        {isLive ? (
          liveVideo
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-center">
            <p className="text-sm text-slate-400">
              {playbackLabel ?? `Playback · ${camera.name}`}
            </p>
            <p className="text-xs text-slate-500">{formatDateTime(scrubTime.toISOString())}</p>
            <p className="text-xs text-slate-600">Recording service connects in Phase 1</p>
          </div>
        )}
        {isLive && (
          <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white">
            <Radio className="h-3 w-3" />
            LIVE
          </div>
        )}
      </div>

      {incidents.length > 0 && (
        <div className="relative h-8 rounded bg-slate-900/60">
          <div className="absolute bottom-3 left-2 right-2 h-0.5 bg-slate-600" />
          {incidents.map((inc) => {
            const left = positionFromIncident(inc, rangeStart, rangeEnd)
            const selected = inc.id === selectedIncidentId
            return (
              <button
                key={inc.id}
                type="button"
                title={inc.title}
                onClick={() => handleIncidentClick(inc)}
                className={`absolute bottom-1.5 z-10 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-400 shadow transition hover:scale-125 ${
                  selected ? 'ring-2 ring-blue-400' : ''
                }`}
                style={{ left: `${left}%` }}
              />
            )
          })}
        </div>
      )}

      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{formatDateTime(rangeStart.toISOString())}</span>
        <span className={isLive ? 'font-medium text-red-400' : 'text-slate-300'}>
          {isLive ? 'Live now' : formatDateTime(scrubTime.toISOString())}
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => onPositionChange(Number(e.target.value))}
        className="timeline-slider w-full"
        aria-label="Timeline — drag right for live"
      />

      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span>Recorded</span>
        <button
          type="button"
          onClick={() => onPositionChange(100)}
          className={`rounded px-2 py-0.5 font-medium transition ${
            isLive
              ? 'bg-red-600/20 text-red-400'
              : 'text-slate-500 hover:bg-slate-800 hover:text-red-400'
          }`}
        >
          Go live →
        </button>
      </div>

      {!isLive && (
        <div className="flex items-center justify-center gap-2 border-t border-slate-800/80 pt-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50"
            aria-label="10 seconds back"
            onClick={() => onPositionChange(Math.max(0, position - 2))}
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-full bg-blue-600 p-3 text-white hover:bg-blue-500"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50"
            aria-label="10 seconds forward"
            onClick={() =>
              onPositionChange(Math.min(LIVE_POSITION_THRESHOLD - 1, position + 2))
            }
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

/** Standalone scrubber placeholder for simple timeline demos */
export function TimelineScrubber({ cameraName }: { cameraName: string }) {
  const now = new Date()
  const start = new Date(now.getTime() - 24 * 3600_000)
  return (
    <UnifiedTimelineScrubber
      camera={{
        id: 'legacy',
        name: cameraName,
        host: '',
        model: '',
        firmware: '',
        location: '',
        status: 'online',
        streamProfile: '',
        recordingEnabled: false,
        lastSeenAt: null,
      }}
      rangeStart={start}
      rangeEnd={now}
      position={100}
      onPositionChange={() => {}}
      liveVideo={
        <div className="flex aspect-video items-center justify-center text-sm text-slate-500">
          Live · {cameraName}
        </div>
      }
    />
  )
}
