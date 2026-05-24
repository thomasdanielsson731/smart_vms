import { ollamaConfig } from './config'

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaChatResponse {
  message: { role: string; content: string }
  done: boolean
}

export class OllamaError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'OllamaError'
  }
}

export async function checkOllamaReachable(): Promise<{ ok: boolean; models: string[] }> {
  try {
    const res = await fetch(`${ollamaConfig.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
      credentials: 'same-origin',
    })
    if (!res.ok) return { ok: false, models: [] }
    const data = (await res.json()) as { models?: { name: string }[] }
    return {
      ok: true,
      models: data.models?.map((m) => m.name) ?? [],
    }
  } catch {
    return { ok: false, models: [] }
  }
}

export async function chatWithOllama(
  messages: OllamaChatMessage[],
  options?: { signal?: AbortSignal },
): Promise<string> {
  const res = await fetch(`${ollamaConfig.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    signal: options?.signal,
    body: JSON.stringify({
      model: ollamaConfig.model,
      messages,
      stream: false,
      options: {
        temperature: 0.4,
        num_predict: 512,
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new OllamaError(
      text || `Ollama responded with HTTP ${res.status}. Run "ollama serve" and check the model.`,
      res.status,
    )
  }

  const data = (await res.json()) as OllamaChatResponse
  return data.message?.content?.trim() ?? ''
}
