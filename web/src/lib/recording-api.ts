import type { RecordingSegment } from '@/types/forensic'
import type { StorageUsageSnapshot } from '@/types/storage'
import type { Camera } from '@/types/camera'

export async function syncCamerasToRecordingService(cameras: Camera[]): Promise<void> {
  const body = {
    cameras: cameras.map((c) => ({
      id: c.id,
      name: c.name,
      host: c.host,
      recordingEnabled: c.recordingEnabled,
    })),
  }
  const res = await fetch('/api/recording/cameras', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok && res.status !== 403) {
    console.warn('[recording] camera sync failed', res.status)
  }
}

export async function fetchRecordingSegments(
  from: Date,
  to: Date,
  cameraId?: string,
): Promise<RecordingSegment[]> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  })
  if (cameraId) params.set('cameraId', cameraId)

  const res = await fetch(`/api/recording/segments?${params}`, { credentials: 'same-origin' })
  if (!res.ok) return []
  const data = (await res.json()) as { segments?: RecordingSegment[] }
  return data.segments ?? []
}

export async function fetchRecordingUsage(): Promise<StorageUsageSnapshot | null> {
  const res = await fetch('/api/recording/usage', { credentials: 'same-origin' })
  if (!res.ok) return null
  return (await res.json()) as StorageUsageSnapshot
}

export function recordingFrameUrl(frameId: string): string {
  return `/api/recording/frame/${encodeURIComponent(frameId)}`
}

export async function fetchNearestRecordingFrame(
  cameraId: string,
  at: Date,
): Promise<{ id: string; capturedAt: string } | null> {
  const params = new URLSearchParams({
    cameraId,
    at: at.toISOString(),
  })
  const res = await fetch(`/api/recording/nearest?${params}`, { credentials: 'same-origin' })
  if (!res.ok) return null
  const data = (await res.json()) as { frame: { id: string; capturedAt: string } | null }
  return data.frame
}
