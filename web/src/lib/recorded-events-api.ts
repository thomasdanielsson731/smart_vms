import type { AgentBacktestRange } from '@/lib/agent-backtest'
import type { ForensicIncident } from '@/types/forensic'

export interface CameraHostRef {
  cameraId: string
  cameraName: string
  host: string
}

export function recordedEventsUrl(
  host: string,
  range: AgentBacktestRange,
  cameraId: string,
  cameraName: string,
): string {
  const params = new URLSearchParams({
    range,
    cameraId,
    cameraName,
  })
  return `/api/camera/${encodeURIComponent(host)}/recorded-events?${params}`
}

export async function fetchRecordedEvents(
  cameras: CameraHostRef[],
  range: AgentBacktestRange,
): Promise<ForensicIncident[]> {
  if (cameras.length === 0) return []

  const results = await Promise.all(
    cameras.map(async (camera) => {
      const res = await fetch(recordedEventsUrl(camera.host, range, camera.cameraId, camera.cameraName), {
        credentials: 'same-origin',
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null
        throw new Error(body?.message ?? `Could not load events for ${camera.cameraName}`)
      }
      const data = (await res.json()) as { events?: ForensicIncident[] }
      return data.events ?? []
    }),
  )

  return results.flat().sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
}
