import { Link } from 'react-router-dom'
import { Video, Wifi } from 'lucide-react'
import type { Camera } from '@/types/camera'
import { CameraStatusBadge } from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/lib/format'

export function CameraCard({ camera }: { camera: Camera }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] transition hover:border-slate-700">
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <Video className="h-10 w-10 text-slate-600" />
        </div>
        <div className="absolute left-3 top-3">
          <CameraStatusBadge status={camera.status} />
        </div>
        {camera.recordingEnabled && camera.status === 'online' && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-red-600/90 px-2 py-0.5 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            REC
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-semibold text-white">{camera.name}</h3>
          <p className="text-sm text-slate-500">
            {camera.location} · {camera.model}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Wifi className="h-3.5 w-3.5" />
          {camera.host}
          <span className="text-slate-700">·</span>
          Last seen: {formatRelativeTime(camera.lastSeenAt)}
        </div>
        <div className="mt-auto flex gap-2 pt-2">
          <Link
            to={`/live?camera=${camera.id}`}
            className="flex-1 rounded-lg bg-blue-600/20 py-2 text-center text-sm font-medium text-blue-300 hover:bg-blue-600/30"
          >
            Live
          </Link>
          <Link
            to={`/timeline?camera=${camera.id}`}
            className="flex-1 rounded-lg bg-slate-700/50 py-2 text-center text-sm font-medium text-slate-300 hover:bg-slate-700"
          >
            Playback
          </Link>
        </div>
      </div>
    </article>
  )
}
