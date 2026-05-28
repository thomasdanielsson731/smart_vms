export interface VapixCameraListenerStatus {
  cameraId: string
  cameraName: string
  host: string
  mode: 'stream' | 'poll' | 'stopped'
  connected: boolean
  lastEventAt: string | null
  lastError: string | null
  ingestedTotal: number
}

export interface VapixEventIngestStatus {
  enabled: boolean
  serverUrl: string | null
  serverReachable: boolean
  ingestedTotal: number
  droppedDuplicates: number
  ingestErrors: number
  lastIngestAt: string | null
  cameras: VapixCameraListenerStatus[]
}

export async function fetchVapixEventIngestStatus(): Promise<VapixEventIngestStatus | null> {
  const res = await fetch('/api/vapix-events/status', { credentials: 'same-origin' })
  if (!res.ok) return null
  const data = (await res.json()) as { status?: VapixEventIngestStatus }
  return data.status ?? null
}
