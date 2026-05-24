export type FaceProfileRole = 'household' | 'guest' | 'service'

export type FaceEnrollmentMode = 'live' | 'playback'

/** Varifrån ansiktet registrerades */
export interface FaceEnrollmentSource {
  cameraId: string
  cameraName: string
  capturedAt: string
  mode: FaceEnrollmentMode
  bboxNorm: [number, number, number, number]
  /** Uppspelningsposition 0–100 (mock) */
  playbackPosition?: number
}

export interface FaceProfile {
  id: string
  name: string
  role: FaceProfileRole
  enrolledAt: string
  notes?: string
  /** Avatar-färg (hex) */
  color: string
  /** Satt om personen namngavs från videomaterial */
  enrollment?: FaceEnrollmentSource
  /** Kameror som lärt sig detta ansikte (minnesregister per kamera) */
  rememberedByCameras: string[]
}

export interface FaceRecognitionSettings {
  enabled: boolean
  minConfidence: number
  alertOnUnknown: boolean
  /** Tom = alla kameror */
  cameraIds: string[]
  /** Måste bekräftas innan aktivering (integritet/CRA) */
  consentAcknowledgedAt: string | null
}

export interface FaceMatch {
  profileId: string | null
  displayName: string
  confidence: number
  unknown: boolean
}

export interface FaceRecognitionEvent {
  id: string
  occurredAt: string
  cameraId: string
  cameraName: string
  match: FaceMatch
  incidentId?: string
}

export const faceRoleLabels: Record<FaceProfileRole, string> = {
  household: 'Household',
  guest: 'Guest',
  service: 'Service/delivery',
}
