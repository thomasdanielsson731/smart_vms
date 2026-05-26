import { useEffect, useState } from 'react'
import type { Camera } from '@/types/camera'
import type { ForensicRange } from '@/types/forensic'
import { searchForensicEvents, type EventSearchResult } from '@/lib/event-search'

export function useEventSearch(
  query: string,
  range: ForensicRange,
  cameras: Camera[],
  cameraId?: string,
): EventSearchResult & { loading: boolean; error: string | null } {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<EventSearchResult>({
    incidents: [],
    source: 'local',
    serverAvailable: false,
  })

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setLoading(false)
      setError(null)
      setResult({ incidents: [], source: 'local', serverAvailable: false })
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    void searchForensicEvents({
      query: trimmed,
      range,
      cameras,
      cameraId,
    })
      .then((next) => {
        if (cancelled) return
        setResult(next)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Search failed')
        setResult({ incidents: [], source: 'local', serverAvailable: false })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [query, range, cameras, cameraId])

  return { ...result, loading, error }
}
