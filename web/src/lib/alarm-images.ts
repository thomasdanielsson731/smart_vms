import type { Incident } from '@/types/incident'
import { isStreamConfigured, snapshotStreamUrlForHost } from '@/lib/camera-stream'

/** Larm yngre än N timmar kan visa live snapshot som preview */
export function isRecentAlarm(occurredAt: string, maxHours = 3): boolean {
  return Date.now() - new Date(occurredAt).getTime() < maxHours * 3600_000
}

export function resolveAlarmImageSrc(
  incident: Incident,
  cameraHost?: string,
): string | null {
  if (incident.bestPicture?.storageUri) {
    return incident.bestPicture.storageUri
  }
  if (cameraHost && isStreamConfigured() && isRecentAlarm(incident.occurredAt)) {
    return snapshotStreamUrlForHost(cameraHost, Date.now())
  }
  return null
}

/** Placeholder-färger per larm-id (tills lagrad bild finns) */
export function placeholderGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  const h = Math.abs(hash) % 360
  return `linear-gradient(135deg, hsl(${h} 35% 22%) 0%, hsl(${(h + 40) % 360} 25% 12%) 100%)`
}

export function formatBestPictureScore(incident: Incident): string | null {
  const score = incident.bestPicture?.score ?? incident.confidence
  if (score == null) return null
  return `${Math.round(score * 100)} %`
}
