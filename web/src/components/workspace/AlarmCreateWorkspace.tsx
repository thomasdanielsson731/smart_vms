import { useState } from 'react'
import { BellPlus, Copy } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { defaultAlarmDraft, type AlarmDraft, type AlarmTrigger } from '@/types/alarm'

export function AlarmCreateWorkspace() {
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
  }

  const triggers: { value: AlarmTrigger; label: string }[] = [
    { value: 'person', label: 'Person' },
    { value: 'vehicle', label: 'Fordon' },
    { value: 'vapix_motion', label: 'VAPIX rörelse' },
    { value: 'line_cross', label: 'Linjeöverträdelse' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">
        Skapa larm (övervakningsregler). Multi-konfig: samma regel på flera kameror med ett klick.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Namn på larm">
          <input
            required
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="t.ex. Natt — garage"
            className={inputCls}
          />
        </Field>

        <Field label="Beskrivning">
          <textarea
            value={draft.description}
            onChange={(e) => update('description', e.target.value)}
            rows={2}
            className={inputCls}
            placeholder="Valfri beskrivning för dig och hushållet"
          />
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Kameror (välj en eller flera)</span>
            <button
              type="button"
              onClick={selectAllCameras}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Alla kameror
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
          Skapa ett separat larm per kamera (bulk)
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Utlösare">
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
          <Field label="Allvar">
            <select
              value={draft.severity}
              onChange={(e) =>
                update('severity', e.target.value as AlarmDraft['severity'])
              }
              className={inputCls}
            >
              <option value="low">Låg</option>
              <option value="medium">Medium</option>
              <option value="high">Hög</option>
            </select>
          </Field>
        </div>

        <Field label="Zon (valfritt)">
          <input
            value={draft.zoneName}
            onChange={(e) => update('zoneName', e.target.value)}
            placeholder="t.ex. uppfart, garage"
            className={inputCls}
          />
        </Field>

        <Field label="Schema">
          <input
            value={draft.schedule}
            onChange={(e) => update('schedule', e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="Tyst tid / quiet hours (valfritt)">
          <input
            value={draft.quietHours}
            onChange={(e) => update('quietHours', e.target.value)}
            placeholder="t.ex. 22:00–06:00"
            className={inputCls}
          />
        </Field>

        <button
          type="submit"
          disabled={!draft.name.trim() || draft.cameraIds.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-40"
        >
          <BellPlus className="h-4 w-4" />
          {bulkMode && draft.cameraIds.length > 1
            ? `Skapa ${draft.cameraIds.length} larm`
            : 'Skapa larm'}
        </button>
      </form>

      {savedId && (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
          Larm sparat (mock). Totalt {alarms.length} larm i systemet.
        </p>
      )}

      {alarms.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Aktiva larm ({alarms.filter((a) => a.enabled).length})
          </h3>
          <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-slate-400">
            {alarms.slice(0, 8).map((a) => (
              <li key={a.id} className="truncate">
                {a.enabled ? '●' : '○'} {a.name}
              </li>
            ))}
          </ul>
        </section>
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
