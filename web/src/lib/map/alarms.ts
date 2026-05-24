import type { ForensicIncident } from '@/types/forensic'
import type { CameraMapPlacement } from '@/types/map'
import { destinationPoint } from '@/lib/map/geo'

export interface MapAlarmPin {
  incident: ForensicIncident
  lat: number
  lng: number
}

const severityColor: Record<ForensicIncident['severity'], string> = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#ef4444',
}

export function severityToColor(severity: ForensicIncident['severity']): string {
  return severityColor[severity]
}

/** Placera larm längs kamerans bildfält (ca 60 % av räckvidd) */
export function alarmPinsFromIncidents(
  incidents: ForensicIncident[],
  placements: Record<string, CameraMapPlacement>,
): MapAlarmPin[] {
  return incidents
    .map((incident) => {
      const p = placements[incident.cameraId]
      if (!p) return null
      const dist = p.rangeM * 0.55
      const [lat, lng] = destinationPoint(p.lat, p.lng, p.heading, dist)
      return { incident, lat, lng }
    })
    .filter((x): x is MapAlarmPin => x != null)
}

export function filterRecentIncidents(
  incidents: ForensicIncident[],
  hours: number,
): ForensicIncident[] {
  const since = Date.now() - hours * 3600_000
  return incidents.filter((i) => new Date(i.occurredAt).getTime() >= since)
}
