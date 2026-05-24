import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { LiveViewPanel } from '@/components/camera/LiveViewPanel'
import { TimelineScrubber } from '@/components/timeline/TimelineScrubber'

export function VideoWorkspace() {
  const { cameras } = useAppConfig()
  const { params, setParam } = useWorkspace()
  const cameraId = params.camera ?? cameras[0]?.id
  const mode = params.mode ?? 'live'
  const camera = cameras.find((c) => c.id === cameraId) ?? cameras[0]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500">Källa:</span>
        {cameras.map((cam) => (
          <button
            key={cam.id}
            type="button"
            onClick={() => setParam('camera', cam.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              cam.id === camera?.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cam.name}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(['live', 'playback'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setParam('mode', m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              mode === m ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m === 'live' ? 'Live' : 'Uppspelning / fil'}
          </button>
        ))}
      </div>
      {camera && mode === 'live' && <LiveViewPanel camera={camera} />}
      {camera && mode === 'playback' && <TimelineScrubber cameraName={camera.name} />}
      <p className="text-xs text-slate-500">
        Från chat: öppna klipp, live eller exporterad fil. Phase 1 kopplar RTSP och segment.
      </p>
    </div>
  )
}
