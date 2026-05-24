import { useSearchParams } from 'react-router-dom'
import { mockCameras } from '@/lib/mock-data'
import { LiveViewPanel } from '@/components/camera/LiveViewPanel'

export function LivePage() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('camera') ?? mockCameras[0]?.id
  const selected = mockCameras.find((c) => c.id === selectedId) ?? mockCameras[0]

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {selected && <LiveViewPanel camera={selected} />}

      <aside className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Select camera
        </h2>
        <ul className="space-y-1">
          {mockCameras.map((cam) => (
            <li key={cam.id}>
              <button
                type="button"
                onClick={() => setParams({ camera: cam.id })}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  cam.id === selected?.id
                    ? 'bg-blue-600/20 font-medium text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {cam.name}
                <span className="ml-2 text-xs text-slate-600">{cam.location}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
