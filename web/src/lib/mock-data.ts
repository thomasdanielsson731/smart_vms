import type { Camera } from '@/types/camera'
import type { Incident } from '@/types/incident'
import { mockBestPicture } from '@/lib/mock-best-picture'

/** Mock Axis-kameror — ersätts av API i Phase 1 */
export const mockCameras: Camera[] = [
  {
    id: 'cam-driveway',
    name: 'Uppfart',
    location: 'Framsida',
    host: '192.168.1.51',
    model: 'AXIS P1465-LE',
    firmware: '11.11.104',
    status: 'online',
    streamProfile: 'Sub 640×360',
    recordingEnabled: true,
    lastSeenAt: new Date().toISOString(),
    vapixUser: 'smartvms_svc',
  },
  {
    id: 'cam-entry',
    name: 'Entré',
    location: 'Dörr',
    host: '192.168.1.52',
    model: 'AXIS M1065-L',
    firmware: '10.12.89',
    status: 'online',
    streamProfile: 'Sub 640×360',
    recordingEnabled: true,
    lastSeenAt: new Date().toISOString(),
    vapixUser: 'smartvms_svc',
  },
  {
    id: 'cam-garden',
    name: 'Trädgård',
    location: 'Baksida',
    host: '192.168.1.53',
    model: 'AXIS P3245-LVE',
    firmware: '11.10.91',
    status: 'degraded',
    streamProfile: 'Sub 640×360',
    recordingEnabled: true,
    lastSeenAt: new Date(Date.now() - 120_000).toISOString(),
    vapixUser: 'smartvms_svc',
  },
  {
    id: 'cam-garage',
    name: 'Garage',
    location: 'Garageport',
    host: '192.168.1.54',
    model: 'AXIS P1455-LE',
    firmware: '11.11.98',
    status: 'offline',
    streamProfile: '—',
    recordingEnabled: false,
    lastSeenAt: new Date(Date.now() - 3_600_000).toISOString(),
    vapixUser: 'smartvms_svc',
  },
]

const t45m = new Date(Date.now() - 45 * 60_000).toISOString()
const t4h = new Date(Date.now() - 4 * 3600_000).toISOString()
const t26h = new Date(Date.now() - 26 * 3600_000).toISOString()

export const mockIncidents: Incident[] = [
  {
    id: 'inc-001',
    title: 'Person i uppfart (efter tyst tid)',
    cameraId: 'cam-driveway',
    cameraName: 'Uppfart',
    severity: 'medium',
    status: 'open',
    occurredAt: t45m,
    ruleName: 'Zon — uppfart natt',
    confidence: 0.89,
    bestPicture: mockBestPicture(t45m, 0.89, [0.42, 0.38, 0.12, 0.28]),
  },
  {
    id: 'inc-002',
    title: 'Fordon vid entré',
    cameraId: 'cam-entry',
    cameraName: 'Entré',
    severity: 'low',
    status: 'acknowledged',
    occurredAt: t4h,
    ruleName: 'Fordon — dagtid',
    confidence: 0.76,
    bestPicture: mockBestPicture(t4h, 0.76, [0.18, 0.45, 0.35, 0.22]),
  },
  {
    id: 'inc-003',
    title: 'VAPIX: rörelse (förfiltrering)',
    cameraId: 'cam-garden',
    cameraName: 'Trädgård',
    severity: 'low',
    status: 'closed',
    occurredAt: t26h,
    ruleName: 'Axis rörelse',
    bestPicture: mockBestPicture(t26h, 0.55, [0.55, 0.5, 0.08, 0.15]),
  },
]

export const systemHealth = {
  server: 'online' as const,
  edge: 'online' as const,
  diskUsedPercent: 62,
  camerasOnline: mockCameras.filter((c) => c.status === 'online').length,
  camerasTotal: mockCameras.length,
  openIncidents: mockIncidents.filter((i) => i.status === 'open').length,
}
