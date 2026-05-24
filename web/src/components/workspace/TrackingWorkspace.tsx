import { Route } from 'lucide-react'

export function TrackingWorkspace() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Cross-camera tracking (re-id / correlation). Available in Phase 3 when the analytics pipeline
        is connected.
      </p>
      <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center">
        <Route className="mx-auto mb-3 h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">No tracks yet</p>
        <p className="mt-1 text-xs text-slate-600">
          Tracks will appear here when person re-identification is enabled.
        </p>
      </div>
      <div className="aspect-video rounded-lg bg-slate-800/50 flex items-center justify-center text-xs text-slate-500">
        Map / floor plan view + bbox overlay (coming soon)
      </div>
    </div>
  )
}
