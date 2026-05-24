import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { syncVapixConfigIfNeeded } from '@/lib/vapix-config-api'
import { loadLocalVapixSettings } from '@/lib/vapix-config-storage'

/** Synkar lokalt sparade kameruppgifter till dev-server efter omstart. */
export function VapixConfigSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    const local = loadLocalVapixSettings()
    if (!local?.user || !local.password) return
    syncVapixConfigIfNeeded(local).catch(() => {})
  }, [user])

  return null
}
