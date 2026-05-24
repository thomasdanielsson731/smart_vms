import { useEffect, useState } from 'react'
import { fetchCameraAcaps } from '@/lib/camera-acaps'
import type { AcapApplication } from '@/types/acap'

export function useCameraAcaps(host: string | undefined) {
  const [applications, setApplications] = useState<AcapApplication[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!host) {
      setApplications([])
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCameraAcaps(host)
      .then((data) => {
        if (!cancelled) {
          setApplications(data.applications)
          setError(data.error ?? null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setApplications([])
          setError(err instanceof Error ? err.message : 'Could not load ACAP applications')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [host])

  return { applications, loading, error }
}
