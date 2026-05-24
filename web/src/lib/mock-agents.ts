import type { MonitoringAgent } from '@/types/agent'

export const mockMonitoringAgents: MonitoringAgent[] = [
  {
    id: 'agent-night-driveway',
    name: 'Natt — uppfart',
    description: 'Person i zon efter 22:00, push + klipp',
    status: 'active',
    cameras: ['Uppfart'],
    schedule: 'Varje dag 22:00–06:00',
    ruleSummary: 'person IN zone driveway AND confidence > 0.85',
    lastTriggeredAt: new Date(Date.now() - 45 * 60_000).toISOString(),
    alertsLast7d: 3,
  },
  {
    id: 'agent-vehicle-entry',
    name: 'Fordon — entré dagtid',
    description: 'Fordon i entrézon, låg prioritet',
    status: 'active',
    cameras: ['Entré'],
    schedule: 'Mån–fre 08:00–18:00',
    ruleSummary: 'vehicle IN zone entry',
    lastTriggeredAt: new Date(Date.now() - 4 * 3600_000).toISOString(),
    alertsLast7d: 12,
  },
  {
    id: 'agent-garage-offline',
    name: 'Garage — VAPIX + rörelse',
    description: 'Pausad tills kamera online',
    status: 'paused',
    cameras: ['Garage'],
    schedule: 'Alltid',
    ruleSummary: 'vapix.motion OR person IN zone garage',
    lastTriggeredAt: new Date(Date.now() - 3 * 86400_000).toISOString(),
    alertsLast7d: 0,
  },
]
