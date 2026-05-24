import { useEffect, useState } from 'react'
import { testCameraStream, type CameraStreamTestResult } from '@/lib/camera-stream-test'

export function useCameraStreamTest(host: string | undefined) {
  const [result, setResult] = useState<CameraStreamTestResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!host) {
      setResult(null)
      return
    }

    let cancelled = false
    setLoading(true)

    testCameraStream(host)
      .then((r) => {
        if (!cancelled) setResult(r)
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            ok: false,
            host,
            code: 'proxy_failed',
            message: 'Could not run stream test. Use npm run dev (not static dist/).',
          })
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [host])

  const retest = () => {
    if (!host) return
    setLoading(true)
    testCameraStream(host)
      .then(setResult)
      .finally(() => setLoading(false))
  }

  return { result, loading, retest, ready: result?.ok === true }
}
