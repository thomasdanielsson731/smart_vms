import { X } from 'lucide-react'
import type { WorkspaceId } from '@/types/chat'
import { useWorkspace } from '@/context/WorkspaceContext'

const titles: Record<Exclude<WorkspaceId, null>, string> = {
  video: 'Video — live & timeline',
  dashboard: 'Dashboard',
  tracking: 'Tracking',
  agents: 'Monitoring agents',
  onboarding: 'Onboarding — network',
  alarms: 'Create alarm',
  forensic: 'Video — live & timeline',
  map: 'Map',
  faces: 'Face recognition',
  'camera-web': 'Camera web UI',
  settings: 'Settings',
}

export function WorkspaceChrome({
  workspace,
  children,
}: {
  workspace: Exclude<WorkspaceId, null>
  children: React.ReactNode
}) {
  const { closeWorkspace } = useWorkspace()

  return (
    <div className="flex h-full min-h-0 flex-col border-l border-slate-800/80 bg-[var(--color-surface-900)]">
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{titles[workspace]}</h2>
        <button
          type="button"
          onClick={closeWorkspace}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          aria-label="Close view"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}
