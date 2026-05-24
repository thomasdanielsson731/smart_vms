import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import type { Camera } from '@/types/camera'
import {
  isStreamConfigured,
  mjpegStreamUrl,
  snapshotStreamUrl,
} from '@/lib/camera-stream'
import { streamTestMessage } from '@/lib/camera-stream-test'
import { useCameraStreamTest } from '@/hooks/useCameraStreamTest'
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
  const mjpegFailedRef = useRef(false)
  const { result: streamTest, loading: testing, retest } = useCameraStreamTest(camera.host)

  const enabled = isStreamConfigured()
  const blockedMessage = streamTestMessage(streamTest)

  const trySnapshot = useCallback(() => {
    setMode('snapshot')
    setError(null)
  }, [])

  useEffect(() => {
    mjpegFailedRef.current = false
    setMode('mjpeg')
    setError(null)
    setLive(false)
  }, [camera.host, blockedMessage])

  useEffect(() => {
    if (mode !== 'snapshot' || !enabled || blockedMessage) return
    const id = setInterval(() => setSnapshotTick((t) => t + 1), 800)
    return () => clearInterval(id)
  }, [mode, enabled, blockedMessage])

  const mjpegSrc = mjpegStreamUrl(camera)
  const snapshotSrc = snapshotStreamUrl(camera, snapshotTick)

  if (!enabled) {
    return (
      <StreamShell camera={camera} live={false} className={className}>
        <Placeholder message="Live video is disabled in settings." />
      </StreamShell>
    )
  }

  if (testing && !streamTest) {
    return (
      <StreamShell camera={camera} live={false} className={className}>
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Testing connection to {camera.host}…</p>
        </div>
      </StreamShell>
    )
  }

  if (blockedMessage) {
    return (
      <StreamShell camera={camera} live={false} className={className}>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm text-slate-300">{blockedMessage}</p>
          <p className="max-w-md text-xs text-slate-500">
            Camera IP: <code className="text-slate-400">{camera.host}</code>
            <br />
            Check <strong className="text-slate-400">Settings → Cameras (VAPIX)</strong> or{' '}
            <code className="text-slate-400">AXIS_VAPIX_USER/PASSWORD</code> in{' '}
            <code className="text-slate-400">web/.env</code>
          </p>
          <button
            type="button"
            onClick={() => {
              retest()
              mjpegFailedRef.current = false
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Test again
          </button>
        </div>
      </StreamShell>
    )
  }

  return (
    <StreamShell camera={camera} live={live} className={className}>
      {mode === 'mjpeg' && (
        <img
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
              blockedMessage ??
                'Could not load video from the camera. Use Settings to verify IP and VAPIX password.',
            )
          }}
        />
      )}

      {mode === 'error' && (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="h-10 w-10 text-amber-500" />
          <p className="text-sm text-slate-300">{error ?? 'Stream unavailable'}</p>
          <p className="max-w-md text-xs text-slate-500">
            Camera IP: <code className="text-slate-400">{camera.host}</code>
            <br />
            1. Set correct IP under <strong className="text-slate-400">Settings → Cameras (VAPIX)</strong>
            <br />
            2. Save VAPIX username + password (often <code className="text-slate-400">root</code>)
            <br />
            3. Run <code className="text-slate-400">npm run dev</code> on the same network as the camera
          </p>
          <button
            type="button"
            onClick={() => {
              retest()
              mjpegFailedRef.current = false
              setMode('mjpeg')
              setError(null)
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Test again
          </button>
        </div>
      )}

      {mode === 'snapshot' && live && (
        <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[10px] text-amber-300">
          Snapshot ~1/s (MJPEG unavailable)
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
    <div className={`relative aspect-video overflow-hidden bg-black ${className}`}>
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
