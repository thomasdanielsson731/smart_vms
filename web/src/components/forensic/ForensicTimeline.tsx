import type { ForensicIncident } from '@/types/forensic'
import { formatDateTime } from '@/lib/format'

const severityColor: Record<ForensicIncident['severity'], string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-400',
  high: 'bg-red-500',
}

interface ForensicTimelineProps {
  rangeStart: Date
  rangeEnd: Date
  incidents: ForensicIncident[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ForensicTimeline({
  rangeStart,
  rangeEnd,
  incidents,
  selectedId,
  onSelect,
}: ForensicTimelineProps) {
  const span = rangeEnd.getTime() - rangeStart.getTime()

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const t = new Date(rangeStart.getTime() + span * f)
    return { left: f * 100, label: formatDateTime(t.toISOString()) }
  })

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4">
      <div className="mb-2 flex justify-between text-xs text-slate-500">
        <span>Tidslinje — larm</span>
        <span>{incidents.length} händelser</span>
      </div>

      <div className="relative mb-8 h-14 rounded-lg bg-slate-800/60">
        {/* Baslinje */}
        <div className="absolute bottom-4 left-2 right-2 h-0.5 bg-slate-600" />

        {incidents.map((inc) => {
          const pos =
            span > 0
              ? ((new Date(inc.occurredAt).getTime() - rangeStart.getTime()) / span) * 100
              : 0
          const clamped = Math.max(2, Math.min(98, pos))
          const selected = inc.id === selectedId

          return (
            <button
              key={inc.id}
              type="button"
              title={`${inc.title} — ${formatDateTime(inc.occurredAt)}`}
              onClick={() => onSelect(inc.id)}
              className={`absolute bottom-2 z-10 -translate-x-1/2 transition-transform hover:scale-125 ${
                selected ? 'scale-125 ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''
              }`}
              style={{ left: `${clamped}%` }}
            >
              <span
                className={`block h-4 w-4 rounded-full ${severityColor[inc.severity]} shadow-lg`}
              />
            </button>
          )
        })}
      </div>

      <div className="relative h-6 text-[10px] text-slate-600">
        {ticks.map((tick) => (
          <span
            key={tick.left}
            className="absolute -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${tick.left}%` }}
          >
            {tick.label.split(' ').slice(-1)[0]}
          </span>
        ))}
      </div>
    </div>
  )
}
