import { Grid2x2, Square } from 'lucide-react'

export type LiveLayoutMode = 'single' | 'grid'

export function LiveLayoutToggle({
  layout,
  onChange,
  cameraCount,
}: {
  layout: LiveLayoutMode
  onChange: (layout: LiveLayoutMode) => void
  cameraCount: number
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/60 p-0.5">
      <button
        type="button"
        onClick={() => onChange('single')}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
          layout === 'single'
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={layout === 'single'}
      >
        <Square className="h-3.5 w-3.5" />
        One camera
      </button>
      <button
        type="button"
        onClick={() => onChange('grid')}
        disabled={cameraCount === 0}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 ${
          layout === 'grid'
            ? 'bg-blue-600 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-pressed={layout === 'grid'}
      >
        <Grid2x2 className="h-3.5 w-3.5" />
        All cameras ({cameraCount})
      </button>
    </div>
  )
}

export function parseLiveLayout(value: string | null | undefined): LiveLayoutMode {
  return value === 'grid' ? 'grid' : 'single'
}
