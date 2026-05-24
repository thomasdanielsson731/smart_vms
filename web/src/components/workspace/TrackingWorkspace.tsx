import { Route } from 'lucide-react'

const mockTracks = [
  {
    id: 'track-1',
    label: 'Person',
    path: ['Driveway 23:12', 'Entrance 23:14'],
    confidence: 0.72,
    status: 'mock',
  },
  {
    id: 'track-2',
    label: 'Vehicle',
    path: ['Entrance 14:02'],
    confidence: 0.81,
    status: 'closed',
  },
]

export function TrackingWorkspace() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Cross-camera tracking (re-id / correlation). Mock — Phase 3.
      </p>
      <ul className="space-y-3">
        {mockTracks.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-white">{t.label}</span>
              <span className="text-xs text-slate-500">{Math.round(t.confidence * 100)} %</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-400">
              <Route className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <span>{t.path.join(' → ')}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="aspect-video rounded-lg bg-slate-800/50 flex items-center justify-center text-xs text-slate-500">
        Map / floor plan view + bbox overlay (coming soon)
      </div>
    </div>
  )
}
