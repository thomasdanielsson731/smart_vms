export type DiscoveryStatus = 'idle' | 'scanning' | 'done' | 'error'

export interface DiscoveredCamera {
  id: string
  host: string
  model: string
  serial: string
  firmware: string
  streamProfile?: string
  /** Redan i registret */
  alreadyRegistered: boolean
  /** Vald för bulk-onboarding */
  selected: boolean
}

export interface OnboardingBatch {
  vapixUser: string
  recordingEnabled: boolean
  /** Used when nameStrategy is prefix-ip, or as fallback when model is unknown */
  namePrefix: string
  /** model = Axis product name from VAPIX; prefix-ip = e.g. "Camera 200" */
  nameStrategy: 'model' | 'prefix-ip'
}

export interface OnboardResult {
  added: number
  skipped: number
  failed: Array<{ host: string; message: string }>
}
