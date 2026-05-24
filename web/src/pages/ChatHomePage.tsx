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
} from 'lucide-react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useAuth } from '@/context/AuthContext'
import { ChatPanel } from '@/components/chat/ChatPanel'
import { WorkspaceRouter } from '@/components/workspace/WorkspaceRouter'
import type { WorkspaceId } from '@/types/chat'

const shortcuts: { id: Exclude<WorkspaceId, null>; label: string; icon: typeof Video }[] = [
  { id: 'onboarding', label: 'Onboarding', icon: Radar },
  { id: 'alarms', label: 'Skapa larm', icon: BellPlus },
  { id: 'map', label: 'Karta', icon: Map },
  { id: 'forensic', label: 'Forensic', icon: FileSearch },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tracking', label: 'Spårning', icon: Route },
  { id: 'agents', label: 'Agenter', icon: Bot },
  { id: 'settings', label: 'Inställningar', icon: Settings },
]

export function ChatHomePage() {
  const { workspace, openWorkspace, closeWorkspace } = useWorkspace()
  const { canAccessWorkspace } = useAuth()
  const hasWorkspace = workspace != null
  const visibleShortcuts = shortcuts.filter((s) => canAccessWorkspace(s.id))

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      {/* Icon rail */}
      <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-slate-800/80 bg-[var(--color-surface-900)] py-3">
        <button
          type="button"
          onClick={() => (hasWorkspace ? closeWorkspace() : undefined)}
          className={`rounded-lg p-2.5 ${!hasWorkspace ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          title={hasWorkspace ? 'Fokus på chatt' : 'Copilot'}
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        <div className="my-2 h-px w-8 bg-slate-800" />
        {visibleShortcuts.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              openWorkspace(
                id,
                id === 'video'
                  ? { camera: 'cam-driveway', mode: 'live' }
                  : id === 'alarms'
                    ? { mode: 'create' }
                    : id === 'forensic'
                      ? { range: '48h' }
                      : undefined,
              )
            }
            className={`rounded-lg p-2.5 transition ${
              workspace === id
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
            }`}
            title={label}
          >
            <Icon className="h-5 w-5" />
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
