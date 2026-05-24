import type { Incident } from '@/types/incident'

export type ForensicRange = '24h' | '48h' | '7d'

/** Inspelningssegment på tidslinjen (kontinuerlig inspelning) */
export interface RecordingSegment {
  id: string
  cameraId: string
  startAt: string
  endAt: string
}

/** Larm med klippfönster för forensic-uppspelning */
export interface ForensicIncident extends Incident {
  clipStartAt: string
  clipEndAt: string
  durationSec: number
}
