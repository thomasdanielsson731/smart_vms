import { useEffect, useState } from 'react'
import { fetchVapixEventIngestStatus, type VapixEventIngestStatus } from '@/lib/vapix-events-api'

export function useVapixEventIngestStatus(pollMs = 30_000): VapixEventIngestStatus | null {
  const [status, setStatus] = useState<VapixEventIngestStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const next = await fetchVapixEventIngestStatus()
      if (!cancelled) setStatus(next)
    }
    void load()
    const timer = setInterval(() => void load(), pollMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [pollMs])

  return status
}
