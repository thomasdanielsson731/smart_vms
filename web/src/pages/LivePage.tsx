import { useSearchParams } from 'react-router-dom'
import { useAppConfig } from '@/context/AppConfigContext'
import { LiveViewPanel } from '@/components/camera/LiveViewPanel'
import { LiveViewGrid } from '@/components/camera/LiveViewGrid'
import { LiveLayoutToggle, parseLiveLayout, type LiveLayoutMode } from '@/components/camera/LiveLayoutToggle'

export function LivePage() {
  const { cameras } = useAppConfig()
  const [params, setParams] = useSearchParams()

  const layout = parseLiveLayout(params.get('layout'))
  const selectedId = params.get('camera') ?? cameras[0]?.id
  const selected = cameras.find((c) => c.id === selectedId) ?? cameras[0]

  const setLayout = (next: LiveLayoutMode) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      if (next === 'grid') p.set('layout', 'grid')
      else p.delete('layout')
      return p
    })
  }

  const selectCamera = (id: string) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('camera', id)
      p.delete('layout')
      return p
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LiveLayoutToggle layout={layout} onChange={setLayout} cameraCount={cameras.length} />
        {layout === 'grid' && (
          <p className="text-xs text-slate-500">
            Showing {cameras.length} stream{cameras.length === 1 ? '' : 's'} simultaneously
          </p>
        )}
      </div>

      <div className={layout === 'single' ? 'grid gap-6 lg:grid-cols-[1fr_280px]' : ''}>
        {layout === 'grid' ? (
          <LiveViewGrid cameras={cameras} />
        ) : (
          <>
            {selected ? (
              <LiveViewPanel camera={selected} />
            ) : (
              <p className="text-sm text-slate-500">No cameras configured.</p>
            )}

            <aside className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Select camera
              </h2>
              <ul className="space-y-1">
                {cameras.map((cam) => (
                  <li key={cam.id}>
                    <button
                      type="button"
                      onClick={() => selectCamera(cam.id)}
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
              {cameras.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLayout('grid')}
                  className="mt-2 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200"
                >
                  View all cameras
                </button>
              )}
            </aside>
          </>
        )}
      </div>
    </div>
  )
}
