import { useEffect, useState } from 'react'
import { Loader2, Sparkles, Save } from 'lucide-react'
import type { Camera } from '@/types/camera'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { snapshotStreamUrl, isStreamConfigured } from '@/lib/camera-stream'
import { suggestCameraNameFromScene, uniqueCameraName } from '@/lib/camera-name-suggest'
import { checkOllamaReachable } from '@/lib/ollama/client'
import { ollamaConfig } from '@/lib/ollama/config'
import { pickVisionModelFromList } from '@/lib/ollama/vision-model'

export function CameraRenameSection({ camera }: { camera: Camera }) {
  const { canWrite } = useAuth()
  const { cameras, updateCamera } = useAppConfig()

  const [nameDraft, setNameDraft] = useState(camera.name)
  const [locationDraft, setLocationDraft] = useState(camera.location)
  const [suggesting, setSuggesting] = useState(false)
  const [suggestError, setSuggestError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [visionHint, setVisionHint] = useState<string | null>(null)

  useEffect(() => {
    setNameDraft(camera.name)
    setLocationDraft(camera.location)
  }, [camera.id, camera.name, camera.location])

  useEffect(() => {
    void checkOllamaReachable().then(({ ok, models }) => {
      if (!ok) {
        setVisionHint('Ollama offline')
        return
      }
      const picked = pickVisionModelFromList(models, ollamaConfig.visionModel)
      setVisionHint(picked ?? `Install: ollama pull ${ollamaConfig.visionModel}`)
    })
  }, [])

  const streamsEnabled = isStreamConfigured()
  const snapshotSrc = streamsEnabled ? snapshotStreamUrl(camera, camera.id) : null
  const dirty = nameDraft.trim() !== camera.name || locationDraft.trim() !== camera.location

  const handleSave = () => {
    const name = nameDraft.trim()
    if (!name) return
    updateCamera(camera.id, { name, location: locationDraft.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSuggest = async () => {
    setSuggesting(true)
    setSuggestError(null)
    try {
      const { name } = await suggestCameraNameFromScene(camera)
      const unique = uniqueCameraName(name, cameras, camera.id)
      setNameDraft(unique)
    } catch (err) {
      setSuggestError(err instanceof Error ? err.message : 'Could not suggest a name')
    } finally {
      setSuggesting(false)
    }
  }

  if (!canWrite) {
    return (
      <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-xs text-slate-500">
        Camera name: <span className="text-slate-300">{camera.name}</span>
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-800/80 bg-slate-900/40 p-3">
      <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Name & scene</h4>

      <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
        {snapshotSrc && (
          <div className="overflow-hidden rounded-md border border-slate-700 bg-black">
            <img
              src={snapshotSrc}
              alt=""
              className="h-[4.5rem] w-full object-cover"
            />
          </div>
        )}

        <div className="min-w-0 space-y-2">
          <label className="block text-xs text-slate-500">
            Display name
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-sm text-white"
              maxLength={48}
            />
          </label>

          <label className="block text-xs text-slate-500">
            Location (optional)
            <input
              type="text"
              value={locationDraft}
              onChange={(e) => setLocationDraft(e.target.value)}
              placeholder="Front of house"
              className="mt-0.5 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-sm text-white"
            />
          </label>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleSuggest()}
          disabled={suggesting || !streamsEnabled}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
        >
          {suggesting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          )}
          Suggest from scene
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || !nameDraft.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {!streamsEnabled && (
        <p className="mt-2 text-xs text-amber-400">Enable camera streams to suggest from scene.</p>
      )}
      {suggestError && <p className="mt-2 text-xs text-red-300">{suggestError}</p>}
      {visionHint && !suggestError && (
        <p className="mt-2 text-[11px] text-slate-600">Vision: {visionHint}</p>
      )}
    </div>
  )
}
