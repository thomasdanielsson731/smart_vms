import { useCallback, useEffect, useState } from 'react'
import {
  fetchCameraAoaStatus,
  saveAoaConfiguration,
  testAoaScenarioAlarm,
} from '@/lib/aoa-api'
import type { AoaConfiguration, AoaStatusResponse } from '@/types/aoa'

export function useCameraAoa(host: string | undefined) {
  const [status, setStatus] = useState<AoaStatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    if (!host) {
      setStatus(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchCameraAoaStatus(host)
      setStatus(data)
      if (!data.available && data.message) setError(data.message)
    } catch (err) {
      setStatus(null)
      setError(err instanceof Error ? err.message : 'Could not load Object Analytics')
    } finally {
      setLoading(false)
    }
  }, [host])

  useEffect(() => {
    void reload()
  }, [reload])

  const saveConfiguration = useCallback(
    async (config: AoaConfiguration) => {
      if (!host) return
      setSaving(true)
      setError(null)
      try {
        await saveAoaConfiguration(host, config)
        await reload()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save Object Analytics config')
        throw err
      } finally {
        setSaving(false)
      }
    },
    [host, reload],
  )

  const sendTestAlarm = useCallback(
    async (scenarioId: number) => {
      if (!host) return
      setError(null)
      try {
        await testAoaScenarioAlarm(host, scenarioId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Test alarm failed')
        throw err
      }
    },
    [host],
  )

  return {
    status,
    loading,
    error,
    saving,
    reload,
    saveConfiguration,
    sendTestAlarm,
  }
}
