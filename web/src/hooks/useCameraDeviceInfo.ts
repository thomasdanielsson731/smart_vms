import { useEffect, useState } from 'react'
import { cameraDeviceInfoUrl } from '@/lib/camera-web'

export interface CameraDeviceInfo {
  brand?: string
  model?: string
  firmware?: string
  serial?: string
  ip?: string
  mac?: string
}

export function useCameraDeviceInfo(host: string | undefined) {
  const [info, setInfo] = useState<CameraDeviceInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!host) {
      setInfo(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(cameraDeviceInfoUrl(host), { credentials: 'same-origin' })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: string } | null
          throw new Error(body?.message ?? `HTTP ${res.status}`)
        }
        return res.json() as Promise<CameraDeviceInfo>
      })
      .then((data) => {
        if (!cancelled) setInfo(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setInfo(null)
          setError(err instanceof Error ? err.message : 'Could not load device info')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [host])

  return { info, loading, error }
}
