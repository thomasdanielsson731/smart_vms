import { useAppConfig } from '@/context/AppConfigContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { CameraFaceMemoryOverlay } from '@/components/face/CameraFaceMemoryOverlay'
import { LiveViewPanel } from '@/components/camera/LiveViewPanel'
import { TimelineScrubber } from '@/components/timeline/TimelineScrubber'
import { profilesRememberedByCamera } from '@/lib/face-memory'

export function VideoWorkspace() {
  const { cameras, faceProfiles, faceSettings } = useAppConfig()
  const { params, setParam } = useWorkspace()
  const cameraId = params.camera ?? cameras[0]?.id
  const mode = params.mode ?? 'live'
  const showFaces = params.faces === '1' || faceSettings.enabled
  const camera = cameras.find((c) => c.id === cameraId) ?? cameras[0]
  const remembered = camera ? profilesRememberedByCamera(faceProfiles, camera.id) : []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500">Source:</span>
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
      <div className="flex flex-wrap gap-2">
        {(['live', 'playback'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setParam('mode', m)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              mode === m ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m === 'live' ? 'Live' : 'Playback / file'}
          </button>
        ))}
        {mode === 'live' && remembered.length > 0 && (
          <button
            type="button"
            onClick={() => setParam('faces', showFaces ? '0' : '1')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              showFaces ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {showFaces ? 'Faces on' : 'Show remembered faces'}
          </button>
        )}
      </div>
      {camera && mode === 'live' && showFaces && remembered.length > 0 && (
        <CameraFaceMemoryOverlay camera={camera} profiles={faceProfiles} autoScanMs={3000} />
      )}
      {camera && mode === 'live' && (!showFaces || remembered.length === 0) && (
        <LiveViewPanel camera={camera} />
      )}
      {camera && mode === 'playback' && <TimelineScrubber cameraName={camera.name} />}
      {camera && remembered.length > 0 && (
        <p className="text-xs text-emerald-400/80">
          {camera.name} remembers: {remembered.map((p) => p.name).join(', ')}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Name new people under Faces → From video. The camera stores memory per device.
      </p>
    </div>
  )
}
