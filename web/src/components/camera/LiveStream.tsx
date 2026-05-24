import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import type { Camera } from '@/types/camera'
import {
  isStreamConfigured,
  mjpegStreamUrl,
  snapshotStreamUrl,
} from '@/lib/camera-stream'
import { CameraStatusBadge } from '@/components/ui/StatusBadge'

type StreamMode = 'mjpeg' | 'snapshot' | 'error'

interface LiveStreamProps {
  camera: Camera
  className?: string
}

export function LiveStream({ camera, className = '' }: LiveStreamProps) {
  const [mode, setMode] = useState<StreamMode>('mjpeg')
  const [error, setError] = useState<string | null>(null)
  const [snapshotTick, setSnapshotTick] = useState(0)
  const [live, setLive] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const mjpegFailedRef = useRef(false)

  const enabled = isStreamConfigured()

  const trySnapshot = useCallback(() => {
    setMode('snapshot')
    setError(null)
  }, [])

  useEffect(() => {
    if (!enabled) {
      setError('Live video avstängd (VITE_CAMERA_STREAM_ENABLED=false)')
      setMode('error')
      return
    }
    setMode('mjpeg')
    setError(null)
    setLive(false)
    mjpegFailedRef.current = false
  }, [camera.host, enabled])

  // Snapshot polling fallback
  useEffect(() => {
    if (mode !== 'snapshot' || !enabled) return
    const id = setInterval(() => setSnapshotTick((t) => t + 1), 800)
    return () => clearInterval(id)
  }, [mode, enabled])

  const mjpegSrc = mjpegStreamUrl(camera)
  const snapshotSrc = snapshotStreamUrl(camera, snapshotTick)

  if (!enabled) {
    return (
      <StreamShell camera={camera} live={false} className={className}>
        <Placeholder message="Live video är avstängd i inställningar." />
      </StreamShell>
    )
  }

  return (
    <StreamShell camera={camera} live={live} className={className}>
      {mode === 'mjpeg' && (
        <img
          ref={imgRef}
          key={camera.host}
          src={mjpegSrc}
          alt={`Live ${camera.name}`}
          className="h-full w-full object-contain bg-black"
          onLoad={() => {
            setLive(true)
            setError(null)
          }}
          onError={() => {
            if (!mjpegFailedRef.current) {
              mjpegFailedRef.current = true
              trySnapshot()
            }
          }}
        />
      )}

      {mode === 'snapshot' && (
        <img
          src={snapshotSrc}
          alt={`Snapshot ${camera.name}`}
          className="h-full w-full object-contain bg-black"
          onLoad={() => {
            setLive(true)
            setError(null)
          }}
          onError={() => {
            setMode('error')
            setLive(false)
            setError(
              'Kunde inte nå kameran. Kontrollera IP i mock-data, gemensamt lösenord under Inställningar, och att kameran är på samma nätverk.',
            )
          }}
        />
      )}

      {mode === 'error' && (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm text-slate-300">{error ?? 'Ström ej tillgänglig'}</p>
          <p className="max-w-sm text-xs text-slate-500">
            Host: {camera.host} · Sätt gemensamt lösenord under{' '}
            <strong className="text-slate-400">Inställningar → Kameror (VAPIX)</strong>
            <br />
            eller i <code className="text-slate-400">web/.env</code> (AXIS_VAPIX_USER/PASSWORD)
          </p>
          <button
            type="button"
            onClick={() => {
              mjpegFailedRef.current = false
              setMode('mjpeg')
              setError(null)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Försök igen
          </button>
        </div>
      )}

      {mode === 'snapshot' && live && (
        <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-amber-300">
          Snapshot ~1/s (MJPEG ej tillgänglig)
        </span>
      )}
    </StreamShell>
  )
}

function StreamShell({
  camera,
  live,
  className,
  children,
}: {
  camera: Camera
  live: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`relative aspect-video overflow-hidden bg-black ${className}`}
    >
      {children}
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <CameraStatusBadge status={camera.status} />
        <span className="rounded bg-black/50 px-2 py-0.5 text-xs text-white">{camera.name}</span>
      </div>
      {live && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          LIVE
        </div>
      )}
    </div>
  )
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-slate-500">
      {message}
    </div>
  )
}
