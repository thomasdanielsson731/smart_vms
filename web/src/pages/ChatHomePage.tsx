import {
  MessageSquare,
  LayoutDashboard,
  Video,
  Route,
  Bot,
  Radar,
  BellPlus,
  Settings,
  FileSearch,
  Map,
  ScanFace,
  Globe,
} from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useAuth } from '@/context/AuthContext'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { WorkspaceRouter } from '@/components/workspace/WorkspaceRouter'
import type { WorkspaceId } from '@/types/chat'

const shortcuts: {
  id: Exclude<WorkspaceId, null>
  label: string
  description: string
  icon: typeof Video
}[] = [
  {
    id: 'onboarding',
    label: 'Onboarding',
    description: 'Discover and add cameras',
    icon: Radar,
  },
  {
    id: 'alarms',
    label: 'Create alarm',
    description: 'Monitoring rules and zones',
    icon: BellPlus,
  },
  {
    id: 'map',
    label: 'Map',
    description: 'Cameras on floor plan',
    icon: Map,
  },
  {
    id: 'forensic',
    label: 'Forensic',
    description: 'Review alarms and clips',
    icon: FileSearch,
  },
  {
    id: 'faces',
    label: 'Faces',
    description: 'Enrol and recognise',
    icon: ScanFace,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Live and playback',
    icon: Video,
  },
  {
    id: 'camera-web',
    label: 'Camera web',
    description: 'Axis web UI per IP',
    icon: Globe,
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Status and recent alarms',
    icon: LayoutDashboard,
  },
  {
    id: 'tracking',
    label: 'Tracking',
    description: 'Follow objects across cameras',
    icon: Route,
  },
  {
    id: 'agents',
    label: 'Agents',
    description: 'Automated AI rules',
    icon: Bot,
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Account, storage and VAPIX',
    icon: Settings,
  },
]

function defaultParams(id: Exclude<WorkspaceId, null>): Record<string, string> | undefined {
  switch (id) {
    case 'video':
      return { camera: 'cam-driveway', mode: 'live' }
    case 'camera-web':
      return { camera: 'cam-driveway', path: '/' }
    case 'alarms':
      return { mode: 'create' }
    case 'forensic':
      return { range: '48h' }
    case 'faces':
      return { tab: 'enroll' }
    default:
      return undefined
  }
}

export function ChatHomePage() {
  const { workspace, openWorkspace, closeWorkspace } = useWorkspace()
  const { canAccessWorkspace } = useAuth()
  const hasWorkspace = workspace != null
  const visibleShortcuts = shortcuts.filter((s) => canAccessWorkspace(s.id))

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      {/* Meny med ikon + beskrivning */}
      <aside className="flex w-28 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-slate-800/80 bg-[var(--color-surface-900)] py-2">
        <button
          type="button"
          onClick={() => (hasWorkspace ? closeWorkspace() : undefined)}
          className={`mx-1.5 flex flex-col items-center rounded-lg px-1 py-2 transition ${
            !hasWorkspace
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
          }`}
        >
          <MessageSquare className="h-5 w-5 shrink-0" />
          <span className="mt-1 text-[10px] font-medium leading-tight">Copilot</span>
          <span className="mt-0.5 text-center text-[9px] leading-tight text-slate-500">
            Ask and control via AI
          </span>
        </button>
        <div className="mx-3 my-1 h-px bg-slate-800" />
        {visibleShortcuts.map(({ id, label, description, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => openWorkspace(id, defaultParams(id))}
            className={`mx-1.5 flex flex-col items-center rounded-lg px-1 py-2 transition ${
              workspace === id
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="mt-1 text-[10px] font-medium leading-tight">{label}</span>
            <span
              className={`mt-0.5 text-center text-[9px] leading-tight ${
                workspace === id ? 'text-blue-400/70' : 'text-slate-500'
              }`}
            >
              {description}
            </span>
          </button>
        ))}
      </aside>

      {/* Chat — always present */}
      <section
        className={`flex min-h-0 flex-col bg-[var(--color-surface-950)] ${
          hasWorkspace ? 'w-[min(440px,40%)] shrink-0 border-r border-slate-800/80' : 'flex-1'
        }`}
      >
        <ChatPanel />
      </section>

      {/* Workspace */}
      {hasWorkspace && workspace && (
        <section className="min-w-0 flex-1">
          <WorkspaceRouter workspace={workspace} />
        </section>
      )}
    </div>
  )
}
