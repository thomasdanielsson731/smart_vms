import { useMemo } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import { generateAlarmTier2Analysis } from '@/lib/alarm-tier2-analytics'
import type { Incident } from '@/types/incident'
import type { AlarmTier2Analysis } from '@/types/alarm-analytics'

export function useAlarmTier2(incident: Incident | null | undefined): AlarmTier2Analysis | null {
  const { faceProfiles, faceSettings } = useAppConfig()

  return useMemo(() => {
    if (!incident) return null
    return generateAlarmTier2Analysis(incident, { faceProfiles, faceSettings })
  }, [incident, faceProfiles, faceSettings])
}
