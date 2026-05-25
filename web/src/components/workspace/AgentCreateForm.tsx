import { useState } from 'react'
import { BellPlus, Copy } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { AgentBacktestPanel } from '@/components/agent/AgentBacktestPanel'
import { defaultAlarmDraft, type AlarmDraft, type AlarmTrigger } from '@/types/alarm'

export function AgentCreateForm({ onCreated }: { onCreated?: () => void }) {
  const { cameras, alarms, addAlarm, addAlarmsBulk } = useAppConfig()
  const [draft, setDraft] = useState<AlarmDraft>(defaultAlarmDraft)
  const [bulkMode, setBulkMode] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)

  const update = <K extends keyof AlarmDraft>(key: K, value: AlarmDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setSavedId(null)
  }

  const toggleCamera = (id: string) => {
    setDraft((d) => ({
      ...d,
      cameraIds: d.cameraIds.includes(id)
        ? d.cameraIds.filter((c) => c !== id)
        : [...d.cameraIds, id],
    }))
    setSavedId(null)
  }

  const selectAllCameras = () => {
    setDraft((d) => ({ ...d, cameraIds: cameras.map((c) => c.id) }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim() || draft.cameraIds.length === 0) return

    if (bulkMode && draft.cameraIds.length > 1) {
      const created = addAlarmsBulk(draft, draft.cameraIds)
      setSavedId(created[0]?.id ?? 'bulk')
    } else {
      const alarm = addAlarm(draft)
      setSavedId(alarm.id)
    }
    setDraft(defaultAlarmDraft())
    onCreated?.()
  }

  const triggers: { value: AlarmTrigger; label: string }[] = [
    { value: 'person', label: 'Person' },
    { value: 'vehicle', label: 'Vehicle' },
    { value: 'vapix_motion', label: 'VAPIX motion' },
    { value: 'line_cross', label: 'Line crossing' },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Create a monitoring agent — one rule per camera or bulk-apply the same rule to many cameras.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Agent name">
          <input
            required
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="e.g. Night — garage"
            className={inputCls}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
            rows={2}
            className={inputCls}
            placeholder="Optional description"
          />
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Cameras (select one or more)</span>
            <button
              type="button"
              onClick={selectAllCameras}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              All cameras
            </button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {cameras.map((cam) => (
              <li key={cam.id}>
                <button
                  type="button"
                  onClick={() => toggleCamera(cam.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    draft.cameraIds.includes(cam.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cam.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/30 px-3 py-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={bulkMode}
            onChange={(e) => setBulkMode(e.target.checked)}
            className="rounded"
          />
          <Copy className="h-4 w-4 text-slate-500" />
          Create a separate agent per camera (bulk)
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trigger">
            <select
              value={draft.trigger}
              onChange={(e) => update('trigger', e.target.value as AlarmTrigger)}
              className={inputCls}
            >
              {triggers.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Severity">
            <select
              value={draft.severity}
              onChange={(e) => update('severity', e.target.value as AlarmDraft['severity'])}
              className={inputCls}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>

        <Field label="Zone (optional)">
          <input
            value={draft.zoneName}
            onChange={(e) => update('zoneName', e.target.value)}
            placeholder="e.g. driveway, garage"
            className={inputCls}
          />
        </Field>

        <Field label="Schedule">
          <input
            value={draft.schedule}
            onChange={(e) => update('schedule', e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Quiet hours (optional)">
          <input
            value={draft.quietHours}
            onChange={(e) => update('quietHours', e.target.value)}
            placeholder="e.g. 22:00–06:00"
            className={inputCls}
          />
        </Field>

        <AgentBacktestPanel rule={{ kind: 'draft', draft }} />

        <button
          type="submit"
          disabled={!draft.name.trim() || draft.cameraIds.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
        >
          <BellPlus className="h-4 w-4" />
          {bulkMode && draft.cameraIds.length > 1
            ? `Create ${draft.cameraIds.length} agents`
            : 'Create agent'}
        </button>
      </form>

      {savedId && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Agent saved. {alarms.length} agent{alarms.length === 1 ? '' : 's'} total in the system.
        </p>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-blue-500/50 focus:outline-none'
