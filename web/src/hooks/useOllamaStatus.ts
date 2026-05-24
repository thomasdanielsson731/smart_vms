import { useEffect, useState } from 'react'
import { checkOllamaReachable } from '@/lib/ollama/client'
import { ollamaConfig } from '@/lib/ollama/config'

export function useOllamaStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [modelAvailable, setModelAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    checkOllamaReachable().then(({ ok, models }) => {
      if (cancelled) return
      setStatus(ok ? 'online' : 'offline')
      setModelAvailable(models.some((m) => m === ollamaConfig.model || m.startsWith(ollamaConfig.model)))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { status, modelAvailable, model: ollamaConfig.model }
}
