import { useState } from 'react'
import { BellRing, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import type { Camera } from '@/types/camera'
import { useAuth } from '@/context/AuthContext'
import { useCameraAoa } from '@/hooks/useCameraAoa'
import {
  addScenario,
  createMotionScenario,
  defaultDeviceId,
  nextScenarioId,
  removeScenario,
  scenarioTypeLabel,
} from '@/lib/aoa-config'

export function CameraAoaSection({ camera }: { camera: Camera }) {
  const { canWrite } = useAuth()
  const { status, loading, error, saving, reload, saveConfiguration, sendTestAlarm } =
    useCameraAoa(camera.host)
  const [newScenarioName, setNewScenarioName] = useState('Motion — full frame')
  const [busyId, setBusyId] = useState<number | null>(null)

  const config = status?.configuration
  const scenarios = config?.scenarios ?? []
  const supportedTypes = status?.capabilities?.scenarios?.supportedScenarios ?? ['motion']
  const canAddMotion = supportedTypes.some((t) => t.toLowerCase() === 'motion')

  const handleAddMotion = async () => {
    if (!config || !newScenarioName.trim()) return
    const scenario = createMotionScenario({
      id: nextScenarioId(scenarios),
      name: newScenarioName.trim(),
      deviceId: defaultDeviceId(config),
    })
    await saveConfiguration(addScenario(config, scenario))
  }

  const handleRemove = async (scenarioId: number) => {
    if (!config) return
    setBusyId(scenarioId)
    try {
      await saveConfiguration(removeScenario(config, scenarioId))
    } finally {
      setBusyId(null)
    }
  }

  const handleTestAlarm = async (scenarioId: number) => {
    setBusyId(scenarioId)
    try {
      await sendTestAlarm(scenarioId)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Object Analytics (AOA)
        </h4>
        <button
          type="button"
          onClick={() => void reload()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {loading && !status && (
        <p className="inline-flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading Object Analytics…
        </p>
      )}

      {!loading && status && !status.available && (
        <p className="text-xs text-slate-500">
          {status.message ??
            'AXIS Object Analytics is not installed or not exposed on this camera.'}
        </p>
      )}

      {status?.available && (
        <div className="space-y-3">
          <p className="text-[11px] text-slate-600">
            API {status.apiVersion ?? '1.x'} · configure scenarios via VAPIX{' '}
            <code className="text-slate-500">/local/objectanalytics/control.cgi</code>
          </p>

          {scenarios.length === 0 ? (
            <p className="text-xs text-slate-500">No scenarios configured on this camera.</p>
          ) : (
            <ul className="space-y-1.5">
              {scenarios.map((scenario) => (
                <li
                  key={scenario.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-800/50 px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200">{scenario.name}</p>
                    <p className="text-slate-500">
                      {scenarioTypeLabel(scenario.type)} · id {scenario.id}
                    </p>
                  </div>
                  {canWrite && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => void handleTestAlarm(scenario.id)}
                        disabled={busyId === scenario.id || saving}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-700 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-600 disabled:opacity-50"
                        title="Send 3s test alarm"
                      >
                        {busyId === scenario.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <BellRing className="h-3 w-3" />
                        )}
                        Test
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleRemove(scenario.id)}
                        disabled={busyId === scenario.id || saving}
                        className="inline-flex items-center gap-1 rounded-md bg-red-950/60 px-2 py-1 text-[11px] text-red-200 hover:bg-red-900/60 disabled:opacity-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canWrite && canAddMotion && config && (
            <div className="flex flex-wrap items-end gap-2 border-t border-slate-800/80 pt-3">
              <label className="min-w-[12rem] flex-1 text-xs text-slate-500">
                New motion scenario
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-sm text-white"
                  maxLength={48}
                />
              </label>
              <button
                type="button"
                onClick={() => void handleAddMotion()}
                disabled={saving || !newScenarioName.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                Add full-frame motion
              </button>
            </div>
          )}

          {!canWrite && (
            <p className="text-[11px] text-slate-600">Sign in as admin to change AOA scenarios.</p>
          )}
        </div>
      )}

      {(error || (status?.available && status.message)) && (
        <p className="mt-2 text-xs text-amber-400">{error ?? status?.message}</p>
      )}
    </div>
  )
}
