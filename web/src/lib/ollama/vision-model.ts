import { checkOllamaReachable } from './client'
import { ollamaConfig } from './config'

/** Substrings that indicate a model supports images in Ollama. */
const VISION_HINTS = ['moondream', 'llava', 'minicpm-v', 'bakllava', 'vision', 'gemma3', 'qwen2.5vl', 'qwen3-vl']

export function modelNameMatches(installed: string[], wanted: string): string | null {
  const w = wanted.toLowerCase()
  const exact = installed.find((m) => m.toLowerCase() === w)
  if (exact) return exact

  const base = w.split(':')[0]
  return (
    installed.find((m) => m.toLowerCase().startsWith(`${base}:`)) ??
    installed.find((m) => m.toLowerCase().split(':')[0] === base) ??
    null
  )
}

export function pickVisionModelFromList(installed: string[], preferred?: string): string | null {
  if (preferred) {
    const match = modelNameMatches(installed, preferred)
    if (match) return match
  }

  for (const hint of VISION_HINTS) {
    const hit = installed.find((m) => m.toLowerCase().includes(hint))
    if (hit) return hit
  }

  return null
}

export async function resolveVisionModel(): Promise<string> {
  const { ok, models } = await checkOllamaReachable()
  if (!ok) {
    throw new Error('Ollama is offline. Start Ollama and try again.')
  }

  const picked = pickVisionModelFromList(models, ollamaConfig.visionModel)
  if (picked) return picked

  throw new Error(
    `No vision model found. Install one: ollama pull moondream (or llava). Configured: ${ollamaConfig.visionModel}`,
  )
}

export function parseOllamaErrorMessage(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return 'Ollama request failed'

  try {
    const json = JSON.parse(trimmed) as { error?: string; message?: string }
    const msg = json.error ?? json.message
    if (msg) {
      const notFound = msg.match(/model ['"]?([^'"]+)['"]? not found/i)
      if (notFound) {
        return `Vision model "${notFound[1]}" is not installed. Run: ollama pull moondream`
      }
      return msg
    }
  } catch {
    /* plain text */
  }

  return trimmed.slice(0, 240)
}
