import { useEffect, useState } from 'react'
import { ScanFace, ShieldAlert, Plus, UserPlus } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { FaceProfileCard } from '@/components/face/FaceProfileCard'
import { FaceMatchBadge } from '@/components/face/FaceMatchBadge'
import { FaceEnrollFromVideo } from '@/components/face/FaceEnrollFromVideo'
import { formatDateTime } from '@/lib/format'
import type { FaceProfileRole } from '@/types/face'
import { faceRoleLabels } from '@/types/face'
import { profileColors } from '@/lib/mock-face-detections'

export type FaceTab = 'enroll' | 'manage' | 'activity' | 'settings'

const tabs: { id: FaceTab; label: string }[] = [
  { id: 'enroll', label: 'From video' },
  { id: 'manage', label: 'Manage' },
  { id: 'activity', label: 'Events' },
  { id: 'settings', label: 'Settings' },
]

export function FaceRecognitionWorkspace() {
  const {
    cameras,
    faceSettings,
    updateFaceSettings,
    faceProfiles,
    addFaceProfile,
    removeFaceProfile,
    faceEvents,
  } = useAppConfig()
  const { canWrite } = useAuth()
  const { params, setParam } = useWorkspace()

  const initialTab = (params.tab as FaceTab) || 'enroll'
  const [tab, setTab] = useState<FaceTab>(initialTab)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<FaceProfileRole>('household')
  const [consentChecked, setConsentChecked] = useState(false)

  useEffect(() => {
    if (params.tab && tabs.some((t) => t.id === params.tab)) {
      setTab(params.tab as FaceTab)
    }
  }, [params.tab])

  const selectTab = (id: FaceTab) => {
    setTab(id)
    setParam('tab', id)
  }

  const handleEnable = () => {
    if (!canWrite || !consentChecked) return
    updateFaceSettings({
      ...faceSettings,
      enabled: true,
      consentAcknowledgedAt: new Date().toISOString(),
    })
  }

  const handleAddProfileManual = () => {
    if (!canWrite || !newName.trim()) return
    addFaceProfile({
      name: newName.trim(),
      role: newRole,
      color: profileColors[faceProfiles.length % profileColors.length],
    })
    setNewName('')
  }

  const filteredEvents = faceSettings.enabled
    ? faceEvents.filter((e) => {
        if (faceSettings.cameraIds.length === 0) return true
        return faceSettings.cameraIds.includes(e.cameraId)
      })
    : []

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Face recognition — name people from live or recorded footage, manage profiles, and
        view matches. Requires activation under Settings.
      </p>

      {!faceSettings.enabled && tab !== 'settings' && (
        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-200">
            <ShieldAlert className="h-5 w-5" />
            <span className="font-medium">Not enabled</span>
          </div>
          <p className="mb-3 text-sm text-amber-200/80">
            You can name people from video now — saved profiles will be used when you enable
            recognition under Settings.
          </p>
          {canWrite && (
            <button
              type="button"
              onClick={() => selectTab('settings')}
              className="text-sm text-amber-300 underline hover:text-amber-100"
            >
              Go to settings →
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1 rounded-lg bg-slate-800/60 p-0.5">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'enroll' && (
        <FaceEnrollFromVideo
          cameras={cameras}
          faceProfiles={faceProfiles}
          profileCount={faceProfiles.length}
          canWrite={canWrite}
          onEnroll={addFaceProfile}
        />
      )}

      {tab === 'manage' && (
        <section className="space-y-4">
          <p className="text-sm text-slate-500">
            All registered people. Profiles created via «From video» show the source camera.
          </p>
          <ul className="space-y-2">
            {faceProfiles.length === 0 && (
              <li className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
                No people yet — go to the From video tab.
              </li>
            )}
            {faceProfiles.map((p) => (
              <FaceProfileCard
                key={p.id}
                profile={p}
                cameras={cameras}
                canEdit={canWrite}
                onRemove={removeFaceProfile}
              />
            ))}
          </ul>

          {canWrite && (
            <div className="rounded-xl border border-dashed border-slate-700 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-white">
                <UserPlus className="h-4 w-4 text-blue-400" />
                Add manually (no video)
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name"
                  className={inputCls}
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as FaceProfileRole)}
                  className={inputCls}
                >
                  {Object.entries(faceRoleLabels).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddProfileManual}
                  disabled={!newName.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === 'activity' && (
        <section className="space-y-2">
          {!faceSettings.enabled ? (
            <p className="text-sm text-slate-500">Enable face recognition to see events.</p>
          ) : filteredEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No face matches in selected period (mock).</p>
          ) : (
            <ul className="space-y-2">
              {filteredEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-xl border border-slate-800/80 bg-slate-800/30 px-3 py-2.5"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <FaceMatchBadge match={ev.match} />
                    <span className="text-xs text-slate-500">{formatDateTime(ev.occurredAt)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {ev.cameraName}
                    {ev.incidentId && (
                      <span className="text-slate-500"> · alarm {ev.incidentId}</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'settings' && (
        <section className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-800/30 p-4">
          <div className="flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Face recognition</h3>
          </div>

          <label className="flex items-start gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={consentChecked || Boolean(faceSettings.consentAcknowledgedAt)}
              onChange={(e) => setConsentChecked(e.target.checked)}
              disabled={!canWrite || faceSettings.enabled}
              className="mt-1 rounded"
            />
            <span>
              I confirm that the household has been informed and that face recognition complies with
              applicable law (CCTV signage, neighbors, GDPR where relevant).
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">
              Minimum match score ({Math.round(faceSettings.minConfidence * 100)} %)
            </span>
            <input
              type="range"
              min={60}
              max={95}
              value={Math.round(faceSettings.minConfidence * 100)}
              onChange={(e) =>
                updateFaceSettings({
                  ...faceSettings,
                  minConfidence: Number(e.target.value) / 100,
                })
              }
              disabled={!canWrite}
              className="w-full"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={faceSettings.alertOnUnknown}
              onChange={(e) =>
                updateFaceSettings({ ...faceSettings, alertOnUnknown: e.target.checked })
              }
              disabled={!canWrite}
              className="rounded"
            />
            Alarm on unknown face (in addition to person detection)
          </label>

          <fieldset>
            <legend className="mb-2 text-xs text-slate-500">Cameras</legend>
            <div className="flex flex-wrap gap-2">
              {cameras.map((cam) => {
                const selected =
                  faceSettings.cameraIds.length === 0 ||
                  faceSettings.cameraIds.includes(cam.id)
                return (
                  <label
                    key={cam.id}
                    className={`cursor-pointer rounded-full px-3 py-1 text-xs ${
                      selected
                        ? 'bg-blue-600/30 text-blue-200'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={faceSettings.cameraIds.includes(cam.id)}
                      onChange={() => {
                        if (!canWrite) return
                        const ids = faceSettings.cameraIds
                        const next = ids.includes(cam.id)
                          ? ids.filter((id) => id !== cam.id)
                          : [...ids, cam.id]
                        updateFaceSettings({
                          ...faceSettings,
                          cameraIds: next.length === cameras.length ? [] : next,
                        })
                      }}
                      disabled={!canWrite}
                    />
                    {cam.name}
                  </label>
                )
              })}
            </div>
          </fieldset>

          {canWrite && (
            <div className="flex flex-wrap gap-2">
              {!faceSettings.enabled ? (
                <button
                  type="button"
                  onClick={handleEnable}
                  disabled={!consentChecked && !faceSettings.consentAcknowledgedAt}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  Enable face recognition
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    updateFaceSettings({
                      ...faceSettings,
                      enabled: false,
                    })
                  }
                  className="rounded-lg border border-red-900/50 px-4 py-2 text-sm text-red-300 hover:bg-red-950/30"
                >
                  Disable
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

const inputCls =
  'rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white'
