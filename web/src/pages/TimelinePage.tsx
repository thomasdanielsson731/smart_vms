import { useSearchParams } from 'react-router-dom'
import { mockCameras } from '@/lib/mock-data'
import { TimelineScrubber } from '@/components/timeline/TimelineScrubber'

export function TimelinePage() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('camera') ?? mockCameras[0]?.id
  const selected = mockCameras.find((c) => c.id === selectedId) ?? mockCameras[0]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <p className="text-sm text-slate-400">
        Spola tillbaka inspelningar per kamera. Segment och seek kopplas till inspelningstjänsten i
        Phase 1.
      </p>

      <div className="flex flex-wrap gap-2">
        {mockCameras.map((cam) => (
          <button
            key={cam.id}
            type="button"
            onClick={() => setParams({ camera: cam.id })}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              cam.id === selected?.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cam.name}
          </button>
        ))}
      </div>

      {selected && <TimelineScrubber cameraName={selected.name} />}
    </div>
  )
}
