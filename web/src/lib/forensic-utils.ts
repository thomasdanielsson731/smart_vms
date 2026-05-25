import type { ForensicIncident, ForensicRange, RecordingSegment } from '@/types/forensic'

export function rangeToMs(range: ForensicRange): number {
  switch (range) {
    case '24h':
      return 24 * 3600_000
    case '48h':
      return 48 * 3600_000
    case '7d':
      return 7 * 24 * 3600_000
  }
}

export function filterIncidentsInRange(
  incidents: ForensicIncident[],
  rangeStart: Date,
  rangeEnd: Date,
  cameraId: string | null,
): ForensicIncident[] {
  return incidents
    .filter((i) => {
      const t = new Date(i.occurredAt).getTime()
      if (t < rangeStart.getTime() || t > rangeEnd.getTime()) return false
      if (cameraId && i.cameraId !== cameraId) return false
      return true
    })
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
}

export function cameraHostForIncident(
  incident: { cameraId: string },
  cameras: { id: string; host: string }[],
): string | undefined {
  return cameras.find((c) => c.id === incident.cameraId)?.host
}

/** Recording segments from the server — empty until the recording service is connected. */
export function recordingSegmentsForRange(
  rangeStart: Date,
  rangeEnd: Date,
  cameraIds: string[],
): RecordingSegment[] {
  void rangeStart
  void rangeEnd
  void cameraIds
  return []
}
