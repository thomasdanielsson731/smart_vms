import { Plus } from 'lucide-react'
import { mockCameras } from '@/lib/mock-data'
import { CameraCard } from '@/components/camera/CameraCard'

export function CamerasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl text-sm text-slate-400">
          Camera registry via VAPIX (Phase 1). Add Axis cameras with host, user and stream
          profiles.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add camera
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockCameras.map((camera) => (
          <CameraCard key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  )
}
