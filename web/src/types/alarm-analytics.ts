import type { FaceProfileRole } from '@/types/face'

/** Personinsikt från tier-2 (ansikte, inferens eller saknad) */
export type Tier2PersonKind = 'known' | 'unknown' | 'inferred' | 'none'

export interface Tier2PersonInsight {
  kind: Tier2PersonKind
  name: string
  profileId?: string | null
  role?: FaceProfileRole
  confidence?: number
  /** Profilen finns i kamerans minne */
  rememberedOnCamera?: boolean
  notes?: string
}

export type Tier2SubjectType = 'person' | 'vehicle' | 'object' | 'motion' | 'unknown'

export type Tier2AssessedPriority = 'routine' | 'review' | 'urgent'

/** Second tier — berikad förklaring av larm och personer efter kameratrigg */
export interface AlarmTier2Analysis {
  incidentId: string
  generatedAt: string
  headline: string
  summary: string
  triggerExplanation: string
  subjectType: Tier2SubjectType
  persons: Tier2PersonInsight[]
  insights: string[]
  assessedPriority: Tier2AssessedPriority
  sources: ('rule' | 'object_detection' | 'face_recognition' | 'vapix')[]
}
