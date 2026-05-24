export type DiscoveryStatus = 'idle' | 'scanning' | 'done' | 'error'

export interface DiscoveredCamera {
  id: string
  host: string
  model: string
  serial: string
  firmware: string
  /** Redan i registret */
  alreadyRegistered: boolean
  /** Vald för bulk-onboarding */
  selected: boolean
}

export interface OnboardingBatch {
  vapixUser: string
  vapixPassword: string
  recordingEnabled: boolean
  namePrefix: string
}
