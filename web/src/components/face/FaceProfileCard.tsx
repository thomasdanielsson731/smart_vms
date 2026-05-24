import { Trash2 } from 'lucide-react'
import type { FaceProfile } from '@/types/face'
import { faceRoleLabels } from '@/types/face'
import { formatDateTime } from '@/lib/format'

export function FaceProfileCard({
  profile,
  cameras,
  onRemove,
  canEdit,
}: {
  profile: FaceProfile
  cameras?: { id: string; name: string }[]
  onRemove?: (id: string) => void
  canEdit?: boolean
}) {
  const cameraNames = profile.rememberedByCameras
    .map((id) => cameras?.find((c) => c.id === id)?.name ?? id)
    .join(', ')
  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-800/30 p-3">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: profile.color }}
      >
        {profile.name.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{profile.name}</p>
        <p className="text-xs text-slate-500">
          {faceRoleLabels[profile.role]} · enrolled {formatDateTime(profile.enrolledAt)}
        </p>
        {profile.rememberedByCameras.length > 0 && (
          <p className="mt-0.5 text-xs text-emerald-400/90">
            Remembers on: {cameraNames || profile.rememberedByCameras.join(', ')}
          </p>
        )}
        {profile.notes && <p className="mt-0.5 truncate text-xs text-slate-400">{profile.notes}</p>}
      </div>
      {canEdit && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(profile.id)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-700 hover:text-red-400"
          title="Remove profile"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  )
}
