import type { MonitoringAgent } from '@/types/agent'

export const mockMonitoringAgents: MonitoringAgent[] = [
  {
    id: 'agent-night-driveway',
    name: 'Night — driveway',
    description: 'Person in zone after 22:00, push + clip',
    status: 'active',
    cameras: ['Driveway'],
    schedule: 'Every day 22:00–06:00',
    ruleSummary: 'person IN zone driveway AND confidence > 0.85',
    lastTriggeredAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    alertsLast7d: 3,
  },
  {
    id: 'agent-vehicle-entry',
    name: 'Vehicle — entry daytime',
    description: 'Vehicle in entry zone, low priority',
    status: 'active',
    cameras: ['Entry'],
    schedule: 'Mon–Fri 08:00–18:00',
    ruleSummary: 'vehicle IN zone entry',
    lastTriggeredAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    alertsLast7d: 12,
  },
  {
    id: 'agent-garage-offline',
    name: 'Garage — VAPIX + motion',
    description: 'Paused until camera online',
    status: 'paused',
    cameras: ['Garage'],
    schedule: 'Always',
    ruleSummary: 'vapix.motion OR person IN zone garage',
    lastTriggeredAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    alertsLast7d: 0,
  },
]
