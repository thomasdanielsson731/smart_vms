import type { Camera } from '@/types/camera'
import { snapshotStreamUrl } from '@/lib/camera-stream'
import { chatWithOllamaVision, OllamaError } from '@/lib/ollama/client'
import { resolveVisionModel } from '@/lib/ollama/vision-model'

const MAX_NAME_LEN = 48

export interface SceneNameSuggestion {
  name: string
  rawResponse: string
}

/** Normalize model output to a short camera display name. */
export function parseSuggestedCameraName(raw: string): string {
  const firstLine = raw
    .trim()
    .split('\n')[0]
    ?.replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^(camera name|name):\s*/i, '')
    .trim()

  if (!firstLine) return ''

  const cleaned = firstLine
    .replace(/\.$/, '')
    .replace(/\s+/g, ' ')
    .slice(0, MAX_NAME_LEN)

  return cleaned
}

export function uniqueCameraName(name: string, cameras: Camera[], excludeId?: string): string {
  const trimmed = name.trim()
  if (!trimmed) return trimmed

  const used = new Set(
    cameras.filter((c) => c.id !== excludeId).map((c) => c.name.trim().toLowerCase()),
  )
  if (!used.has(trimmed.toLowerCase())) return trimmed

  let i = 2
  while (used.has(`${trimmed} (${i})`.toLowerCase())) i += 1
  return `${trimmed} (${i})`
}

async function fetchSnapshotBase64(camera: Camera): Promise<string> {
  const res = await fetch(snapshotStreamUrl(camera, Date.now()), {
    credentials: 'same-origin',
    signal: AbortSignal.timeout(12_000),
  })
  if (!res.ok) {
    throw new Error('Could not load a snapshot from the camera. Check stream settings and VAPIX credentials.')
  }
  const blob = await res.blob()
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

const SCENE_NAME_PROMPT = `You name home security cameras from a single still image.

Rules:
- Reply with ONE short English name only (2–5 words).
- Describe the place or view (e.g. "Front door", "Driveway", "Back garden", "Garage interior").
- No quotes, no punctuation at the end, no explanation.
- Do not include "camera" in the name unless essential (e.g. "Roof camera" is OK).
- If the scene is unclear, pick the best guess from visible context.`

export async function suggestCameraNameFromScene(
  camera: Camera,
  options?: { signal?: AbortSignal },
): Promise<SceneNameSuggestion> {
  const visionModel = await resolveVisionModel()
  const imageBase64 = await fetchSnapshotBase64(camera)

  const rawResponse = await chatWithOllamaVision(
    [
      { role: 'system', content: SCENE_NAME_PROMPT },
      {
        role: 'user',
        content: `Suggest a name for this camera (${camera.model}, IP ${camera.host}).`,
        images: [imageBase64],
      },
    ],
    { model: visionModel, signal: options?.signal },
  )

  const name = parseSuggestedCameraName(rawResponse)
  if (!name) {
    throw new OllamaError(
      `Vision model returned an empty name. Try again or enter a name manually. Model: ${visionModel}`,
    )
  }

  return { name, rawResponse }
}
