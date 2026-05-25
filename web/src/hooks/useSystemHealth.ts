import { useEffect, useState } from 'react'
import { fetchSystemHealth, type SystemHealth } from '@/lib/system-health-api'

export function useSystemHealth(pollMs = 30_000): SystemHealth | null {
  const [health, setHealth] = useState<SystemHealth | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const next = await fetchSystemHealth()
      if (!cancelled) setHealth(next)
    }
    void load()
    const timer = setInterval(load, pollMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [pollMs])

  return health
}
