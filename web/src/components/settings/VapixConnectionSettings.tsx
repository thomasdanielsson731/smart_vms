import { useEffect, useState } from 'react'
import { Camera, Save, ShieldCheck, Wifi, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { fetchVapixConfig, saveVapixConfig } from '@/lib/vapix-config-api'
import { defaultVapixUser, loadLocalVapixUser, saveLocalVapixUser } from '@/lib/vapix-config-storage'
import { vapixSourceLabels, type VapixConfigStatus } from '@/types/vapix'
import { testCameraStream, streamTestMessage } from '@/lib/camera-stream-test'

export function VapixConnectionSettingsPanel() {
  const { canWrite } = useAuth()
  const { cameras, updateCameraHost } = useAppConfig()
  const [status, setStatus] = useState<VapixConfigStatus | null>(null)
  const [user, setUser] = useState(defaultVapixUser)
  const [password, setPassword] = useState('')
  const [hostDrafts, setHostDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false
    fetchVapixConfig()
      .then((remote) => {
        if (cancelled) return
        setStatus(remote)
        setUser(remote.user || loadLocalVapixUser() || defaultVapixUser)
      })
      .catch((err) => {
        if (!cancelled) {
          setUser(loadLocalVapixUser() || defaultVapixUser)
          setError(err instanceof Error ? err.message : 'Could not load camera credentials')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    if (!canWrite) return
    setError(null)
    setSaving(true)
    try {
      const next = await saveVapixConfig({ user: user.trim(), password })
      saveLocalVapixUser(user.trim())
      setPassword('')
      setStatus(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const saveHost = (cameraId: string) => {
    const host = (hostDrafts[cameraId] ?? cameras.find((c) => c.id === cameraId)?.host ?? '').trim()
    updateCameraHost(cameraId, host)
    setHostDrafts((prev) => {
      const next = { ...prev }
      delete next[cameraId]
      return next
    })
  }

  const runTest = async (cameraId: string, host: string) => {
    setTestingId(cameraId)
    const result = await testCameraStream(host)
    const msg = result.ok ? 'Connection OK — video should work.' : streamTestMessage(result)
    setTestResults((prev) => ({ ...prev, [cameraId]: msg ?? result.message }))
    setTestingId(null)
  }

  return (
    <section className="rounded-xl border border-slate-800/80 bg-[var(--color-surface-800)] p-6">
      <div className="mb-4 flex items-center gap-2">
        <Camera className="h-5 w-5 text-blue-400" />
        <h2 className="text-base font-semibold text-white">Cameras (VAPIX)</h2>
      </div>

      <p className="mb-4 text-sm text-slate-400">
        Shared login for all Axis cameras plus each camera&apos;s IP address on your LAN.
        Required for live video. Use <code className="text-slate-500">npm run dev</code>.
      </p>

      {status?.configured && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Active source: {vapixSourceLabels[status.source]}
        </div>
      )}

      {!status?.configured && !loading && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          No camera password saved yet — live video will not work until you save credentials below.
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">
                VAPIX user (all cameras)
              </span>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                disabled={!canWrite}
                placeholder="root"
                autoComplete="username"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">
                Shared password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!canWrite}
                placeholder={status?.configured ? 'Re-enter when changing password' : 'Camera password'}
                autoComplete="new-password"
                className={inputCls}
              />
            </label>

            {!canWrite && (
              <p className="text-xs text-amber-400/90">
                Only administrators can change camera credentials.
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={!canWrite || saving || !user.trim() || (!password && !status?.configured)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : saved ? 'Saved' : 'Save camera credentials'}
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-medium text-slate-200">Camera IP addresses</h3>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Enter each camera&apos;s real IP (from Axis web UI or your router). Mock defaults
              192.168.1.51–54 are placeholders.
            </p>
            <ul className="space-y-3">
              {cameras.map((cam) => {
                const draft = hostDrafts[cam.id]
                const value = draft ?? cam.host
                const testMsg = testResults[cam.id]
                const testing = testingId === cam.id
                return (
                  <li
                    key={cam.id}
                    className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-3"
                  >
                    <p className="mb-2 text-sm font-medium text-slate-200">{cam.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setHostDrafts((prev) => ({ ...prev, [cam.id]: e.target.value }))
                        }
                        disabled={!canWrite}
                        placeholder="192.168.x.x"
                        className={`min-w-[140px] flex-1 ${inputCls}`}
                      />
                      {canWrite && draft != null && draft !== cam.host && (
                        <button
                          type="button"
                          onClick={() => saveHost(cam.id)}
                          className="rounded-lg bg-slate-700 px-3 py-2 text-xs text-white hover:bg-slate-600"
                        >
                          Save IP
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => runTest(cam.id, value)}
                        disabled={testing || !value.trim()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                      >
                        {testing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : testMsg?.includes('OK') ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : null}
                        Test video
                      </button>
                    </div>
                    {testMsg && (
                      <p
                        className={`mt-2 text-xs ${testMsg.includes('OK') ? 'text-emerald-400' : 'text-amber-300/90'}`}
                      >
                        {testMsg}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="text-xs text-slate-600">
            Alternative: set <code className="text-slate-500">AXIS_VAPIX_USER</code> /{' '}
            <code className="text-slate-500">AXIS_VAPIX_PASSWORD</code> and optional{' '}
            <code className="text-slate-500">VITE_CAMERA_HOSTS=ip1,ip2,…</code> in{' '}
            <code className="text-slate-500">web/.env</code>, then restart the dev server.
          </p>
        </div>
      )}
    </section>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white disabled:opacity-60'
