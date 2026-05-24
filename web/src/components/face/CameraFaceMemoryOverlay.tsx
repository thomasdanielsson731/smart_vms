import { useCallback, useEffect, useState } from 'react'
import type { Camera } from '@/types/camera'
import type { FaceProfile } from '@/types/face'
import { LiveStream } from '@/components/camera/LiveStream'
import { FaceBoxOverlay } from '@/components/face/FaceBoxOverlay'
import { profilesRememberedByCamera, scanFrameWithCameraMemory } from '@/lib/face-memory'
import type { DetectedFaceWithMemory } from '@/lib/face-memory'

interface CameraFaceMemoryOverlayProps {
  camera: Camera
  profiles: FaceProfile[]
  /** Automatisk skanning var N ms (0 = av) */
  autoScanMs?: number
  onFaceClick?: (face: DetectedFaceWithMemory) => void
  className?: string
}

/** Live video + ihågkomna ansikten som kameran känner igen */
export function CameraFaceMemoryOverlay({
  camera,
  profiles,
  autoScanMs = 0,
  onFaceClick,
  className = '',
}: CameraFaceMemoryOverlayProps) {
  const [faces, setFaces] = useState<DetectedFaceWithMemory[]>([])
  const remembered = profilesRememberedByCamera(profiles, camera.id)

  const scan = useCallback(() => {
    setFaces(scanFrameWithCameraMemory(camera.id, profiles, Date.now() % 1000))
  }, [camera.id, profiles])

  useEffect(() => {
    scan()
  }, [scan])

  useEffect(() => {
    if (autoScanMs <= 0 || remembered.length === 0) return
    const id = setInterval(scan, autoScanMs)
    return () => clearInterval(id)
  }, [autoScanMs, remembered.length, scan])

  return (
    <div className={`relative ${className}`}>
      <LiveStream camera={camera} />
      {remembered.length > 0 && faces.length > 0 && (
        <FaceBoxOverlay faces={faces} selectedId={null} onSelect={(f) => onFaceClick?.(f)} />
      )}
      {remembered.length > 0 && (
        <div className="absolute bottom-2 left-2 z-20 rounded bg-black/70 px-2 py-1 text-[10px] text-emerald-300">
          Camera remembers: {remembered.map((p) => p.name).join(', ')}
        </div>
      )}
    </div>
  )
}
