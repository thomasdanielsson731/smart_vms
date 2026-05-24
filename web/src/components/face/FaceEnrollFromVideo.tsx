import { useCallback, useEffect, useMemo, useState } from 'react'
import { Camera, Scan, UserPlus, Video } from 'lucide-react'
import type { Camera as CameraType } from '@/types/camera'
import type { FaceProfile } from '@/types/face'
import { profileColors } from '@/lib/face-colors'
import {
  profilesRememberedByCamera,
  scanFrameWithCameraMemory,
  type DetectedFaceWithMemory,
} from '@/lib/face-memory'
import type { FaceEnrollmentMode, FaceProfileRole } from '@/types/face'
import { faceRoleLabels } from '@/types/face'
import { LiveStream } from '@/components/camera/LiveStream'
import { FaceBoxOverlay } from '@/components/face/FaceBoxOverlay'
import { formatDateTime } from '@/lib/format'

interface FaceEnrollFromVideoProps {
  cameras: CameraType[]
  faceProfiles: FaceProfile[]
  profileCount: number
  canWrite: boolean
  onEnroll: (draft: {
    name: string
    role: FaceProfileRole
    color: string
    enrollment: {
      cameraId: string
      cameraName: string
      capturedAt: string
      mode: FaceEnrollmentMode
      bboxNorm: [number, number, number, number]
      playbackPosition?: number
    }
  }) => void
}

export function FaceEnrollFromVideo({
  cameras,
  faceProfiles,
  profileCount,
  canWrite,
  onEnroll,
}: FaceEnrollFromVideoProps) {
  const [cameraId, setCameraId] = useState(cameras[0]?.id ?? '')
  const [mode, setMode] = useState<FaceEnrollmentMode>('live')
  const [playbackPos, setPlaybackPos] = useState(42)
  const [faces, setFaces] = useState<DetectedFaceWithMemory[]>([])
  const [selected, setSelected] = useState<DetectedFaceWithMemory | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState<FaceProfileRole>('household')
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [playbackBaseMs] = useState(() => Date.now())

  const camera = cameras.find((c) => c.id === cameraId) ?? cameras[0]
  const rememberedOnCamera = useMemo(
    () => (camera ? profilesRememberedByCamera(faceProfiles, camera.id) : []),
    [faceProfiles, camera],
  )

  const scanFrame = useCallback(() => {
    if (!camera) return
    setFaces(scanFrameWithCameraMemory(camera.id, faceProfiles, Date.now() % 1000))
    setSelected(null)
    setSavedMsg(null)
  }, [camera, faceProfiles])

  const [liveMemoryFaces, setLiveMemoryFaces] = useState<DetectedFaceWithMemory[]>([])

  useEffect(() => {
    if (mode !== 'live' || !camera || faces.length > 0) return
    const tick = () =>
      setLiveMemoryFaces(scanFrameWithCameraMemory(camera.id, faceProfiles, Date.now() % 1000))
    tick()
    if (rememberedOnCamera.length === 0) return
    const id = setInterval(tick, 2500)
    return () => clearInterval(id)
  }, [mode, camera, faceProfiles, faces.length, rememberedOnCamera.length])

  const displayFaces = faces.length > 0 ? faces : mode === 'live' ? liveMemoryFaces : faces

  const playbackTimestamp = useMemo(() => {
    const offsetMs = ((100 - playbackPos) / 100) * 24 * 3600_000
    return new Date(playbackBaseMs - offsetMs).toISOString()
  }, [playbackBaseMs, playbackPos])

  const handleFaceSelect = (face: DetectedFaceWithMemory) => {
    if (face.matchedName && !face.unknown) {
      setSelected(null)
      setSavedMsg(`${face.matchedName} — camera ${camera?.name} already remembers this person`)
      setTimeout(() => setSavedMsg(null), 3500)
      return
    }
    setSelected(face)
    setName('')
    setSavedMsg(null)
  }

  const handleSave = () => {
    if (!canWrite || !selected || !name.trim() || !camera || selected.unknown === false) return
    onEnroll({
      name: name.trim(),
      role,
      color: profileColors[profileCount % profileColors.length],
      enrollment: {
        cameraId: camera.id,
        cameraName: camera.name,
        capturedAt: mode === 'live' ? new Date().toISOString() : playbackTimestamp,
        mode,
        bboxNorm: selected.bboxNorm,
        playbackPosition: mode === 'playback' ? playbackPos : undefined,
      },
    })
    const savedName = name.trim()
    setName('')
    setSelected(null)
    setSavedMsg(`Camera ${camera.name} will remember ${savedName}`)
    setTimeout(() => setSavedMsg(null), 4000)
    scanFrame()
  }

  if (!camera) {
    return <p className="text-sm text-slate-500">No camera available.</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        When you name someone here, their face is saved in <strong className="text-slate-300">camera memory</strong>
        — the same camera will recognize them on the next scan and in live view (green labels).
      </p>

      {rememberedOnCamera.length > 0 && (
        <p className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
          {camera.name} remembers: {rememberedOnCamera.map((p) => p.name).join(', ')}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500">Camera:</span>
        {cameras.map((cam) => (
          <button
            key={cam.id}
            type="button"
            onClick={() => {
              setCameraId(cam.id)
              setFaces([])
            }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              cam.id === camera.id
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
            onClick={() => setMode(m)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
              mode === m ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {m === 'live' ? <Camera className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
            {m === 'live' ? 'Live' : 'Recorded clip'}
          </button>
        ))}
        <button
          type="button"
          onClick={scanFrame}
          disabled={!canWrite}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          <Scan className="h-3.5 w-3.5" />
          Scan faces
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-800/80 bg-black">
        {mode === 'live' ? (
          <div className="relative">
            <LiveStream camera={camera} />
            {displayFaces.length > 0 && (
              <FaceBoxOverlay
                faces={displayFaces}
                selectedId={selected?.id ?? null}
                onSelect={handleFaceSelect}
              />
            )}
            {rememberedOnCamera.length > 0 && (
              <div className="absolute bottom-2 left-2 z-20 rounded bg-black/70 px-2 py-1 text-[10px] text-emerald-300">
                Camera remembers: {rememberedOnCamera.map((p) => p.name).join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-4 text-center">
              <Video className="h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-400">Playback · {camera.name}</p>
              <p className="text-xs text-slate-500">{formatDateTime(playbackTimestamp)}</p>
            </div>
            {faces.length > 0 && (
              <FaceBoxOverlay
                faces={faces}
                selectedId={selected?.id ?? null}
                onSelect={handleFaceSelect}
              />
            )}
            <input
              type="range"
              min={0}
              max={100}
              value={playbackPos}
              onChange={(e) => setPlaybackPos(Number(e.target.value))}
              className="timeline-slider absolute bottom-3 left-3 right-3 z-10"
              aria-label="Position in clip"
            />
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500">
        {mode === 'live'
          ? displayFaces.length === 0
            ? 'Click «Scan faces» to find unknowns. Green labels = camera remembers.'
            : 'Green = remembered. Click yellow «Unknown» to name and save to camera memory.'
          : faces.length === 0
            ? 'Click «Scan faces». Green labels = camera remembers. Yellow = unknown.'
            : `${faces.length} face(s) — click unknown (yellow) to name.`}
      </p>

      {selected?.unknown && canWrite && (
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-200">
            <UserPlus className="h-4 w-4" />
            Teach camera {camera.name} to recognize this person
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoFocus
              className={inputCls}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as FaceProfileRole)}
              className={inputCls}
            >
              {Object.entries(faceRoleLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              Save to camera memory
            </button>
          </div>
        </div>
      )}

      {savedMsg && (
        <p className="rounded-lg border border-emerald-800/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
          {savedMsg}
        </p>
      )}

      {!canWrite && (
        <p className="text-xs text-amber-400/90">Only administrators can teach cameras new faces.</p>
      )}
    </div>
  )
}

const inputCls =
  'rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white'
