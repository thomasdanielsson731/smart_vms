/** Best picture — högst poängsatta bildruta vid larm (edge/server) */
export interface AlarmBestPicture {
  /** När bilden fångades */
  capturedAt: string
  /** Detektions-/urvalspoäng för denna ruta (0–1) */
  score: number
  /** Bbox normaliserad [x, y, w, h] 0–1 i bild */
  bboxNorm?: [number, number, number, number]
  /** Lagrad bild (S3/minio) — Phase 2+ */
  storageUri?: string
}

export type IncidentSeverity = 'low' | 'medium' | 'high'
export type IncidentStatus = 'open' | 'acknowledged' | 'closed'

export interface Incident {
  id: string
  title: string
  cameraId: string
  cameraName: string
  severity: IncidentSeverity
  status: IncidentStatus
  occurredAt: string
  ruleName?: string
  confidence?: number
  bestPicture?: AlarmBestPicture
}
