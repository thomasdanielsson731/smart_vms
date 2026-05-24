export type CameraStatus = 'online' | 'offline' | 'degraded' | 'unknown'

export interface Camera {
  id: string
  name: string
  location: string
  host: string
  model: string
  firmware: string
  status: CameraStatus
  streamProfile: string
  recordingEnabled: boolean
  lastSeenAt: string | null
  vapixUser: string
  thumbnailUrl?: string
}
