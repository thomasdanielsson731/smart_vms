export interface SystemHealth {
  ok: boolean
  mqttConnected: boolean
  databaseConnected: boolean
  eventsIngestedTotal: number
  eventsDroppedTotal: number
  openIncidents: number
  avgPipelineLagMs: number
  lastEventAt: string | null
}

export async function fetchSystemHealth(): Promise<SystemHealth | null> {
  const res = await fetch('/api/vms/health/system', { credentials: 'same-origin' })
  if (!res.ok) return null
  return (await res.json()) as SystemHealth
}
