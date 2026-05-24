import { useWorkspace } from '@/context/WorkspaceContext'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { formatRelativeTime } from '@/lib/format'
import { AgentCreateForm } from './AgentCreateForm'
import { BellPlus, Pause, Play } from 'lucide-react'

type AgentsTab = 'list' | 'create'

function parseAgentsTab(mode: string | undefined): AgentsTab {
  return mode === 'create' ? 'create' : 'list'
}

export function AgentsWorkspace() {
  const { params, setParams } = useWorkspace()
  const { canWrite } = useAuth()
  const { alarms, cameras, toggleAlarm } = useAppConfig()
  const tab = parseAgentsTab(params.mode)

  const setTab = (next: AgentsTab) => {
    if (next === 'create') setParams({ mode: 'create' })
    else setParams({ mode: undefined })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Monitoring agents — automated rules that watch cameras and raise alarms.
      </p>

      <div className="flex rounded-lg bg-slate-800/60 p-0.5">
        {(
          [
            { id: 'list' as const, label: 'All agents' },
            { id: 'create' as const, label: 'Create agent' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            disabled={id === 'create' && !canWrite}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
              tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'create' ? (
        canWrite ? (
          <AgentCreateForm onCreated={() => setTab('list')} />
        ) : (
          <p className="text-sm text-slate-400">
            Only administrators can create agents. You can view existing agents in the list.
          </p>
        )
      ) : (
        <>
          {canWrite && (
            <button
              type="button"
              onClick={() => setTab('create')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
            >
              <BellPlus className="h-4 w-4" />
              Create new agent
            </button>
          )}
          <ul className="space-y-3">
            {alarms.map((alarm) => {
              const camNames = alarm.cameraIds
                .map((id) => cameras.find((c) => c.id === id)?.name ?? id)
                .join(', ')
              return (
                <li
                  key={alarm.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white">{alarm.name}</h3>
                      <p className="text-xs text-slate-500">{alarm.description || '—'}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        alarm.enabled
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {alarm.enabled ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <dl className="grid gap-1 text-xs text-slate-400">
                    <div>
                      <dt className="inline text-slate-600">Cameras: </dt>
                      <dd className="inline">{camNames || '—'}</dd>
                    </div>
                    <div>
                      <dt className="inline text-slate-600">Schedule: </dt>
                      <dd className="inline">{alarm.schedule}</dd>
                    </div>
                    <div>
                      <dt className="inline text-slate-600">Trigger: </dt>
                      <dd className="inline font-mono text-slate-500">{alarm.trigger}</dd>
                    </div>
                    <div>
                      <dt className="inline text-slate-600">Created: </dt>
                      <dd className="inline">{formatRelativeTime(alarm.createdAt)}</dd>
                    </div>
                  </dl>
                  {canWrite && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleAlarm(alarm.id)}
                        className="flex items-center gap-1 rounded-lg bg-slate-700/80 px-3 py-1.5 text-xs text-slate-300"
                      >
                        {alarm.enabled ? (
                          <>
                            <Pause className="h-3 w-3" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3" /> Enable
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
