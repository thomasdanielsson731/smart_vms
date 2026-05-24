import type { Camera } from '@/types/camera'

import type { Incident } from '@/types/incident'

import { mockBestPicture } from '@/lib/mock-best-picture'



/** Mock Axis cameras — replaced by API in Phase 1 */

export const mockCameras: Camera[] = [

  {

    id: 'cam-driveway',

    name: 'Driveway',

    location: 'Front',

    host: '192.168.68.200',

    model: '—',

    firmware: '—',

    status: 'online',

    streamProfile: 'Sub 640×360',

    recordingEnabled: true,

    lastSeenAt: new Date().toISOString(),

  },

  {

    id: 'cam-entry',

    name: 'Entry',

    location: 'Door',

    host: '192.168.68.201',

    model: '—',

    firmware: '—',

    status: 'online',

    streamProfile: 'Sub 640×360',

    recordingEnabled: true,

    lastSeenAt: new Date().toISOString(),

  },

  {

    id: 'cam-garden',

    name: 'Garden',

    location: 'Rear',

    host: '192.168.68.202',

    model: '—',

    firmware: '—',

    status: 'degraded',

    streamProfile: 'Sub 640×360',

    recordingEnabled: true,

    lastSeenAt: new Date(Date.now() - 120_000).toISOString(),

  },

  {

    id: 'cam-garage',

    name: 'Garage',

    location: 'Garage door',

    host: '192.168.68.203',

    model: '—',

    firmware: '—',

    status: 'offline',

    streamProfile: '—',

    recordingEnabled: false,

    lastSeenAt: new Date(Date.now() - 3_600_000).toISOString(),

  },

]



const t45m = new Date(Date.now() - 45 * 60_000).toISOString()

const t4h = new Date(Date.now() - 4 * 3600_000).toISOString()

const t26h = new Date(Date.now() - 26 * 3600_000).toISOString()



export const mockIncidents: Incident[] = [

  {

    id: 'inc-001',

    title: 'Person on driveway (after quiet hours)',

    cameraId: 'cam-driveway',

    cameraName: 'Driveway',

    severity: 'medium',

    status: 'open',

    occurredAt: t45m,

    ruleName: 'Zone — driveway night',

    confidence: 0.89,

    bestPicture: mockBestPicture(t45m, 0.89, [0.42, 0.38, 0.12, 0.28]),

    faceMatch: {

      profileId: null,

      displayName: 'Unknown person',

      confidence: 0.82,

      unknown: true,

    },

  },

  {

    id: 'inc-002',

    title: 'Vehicle at entry',

    cameraId: 'cam-entry',

    cameraName: 'Entry',

    severity: 'low',

    status: 'acknowledged',

    occurredAt: t4h,

    ruleName: 'Vehicle — daytime',

    confidence: 0.76,

    bestPicture: mockBestPicture(t4h, 0.76, [0.18, 0.45, 0.35, 0.22]),

  },

  {

    id: 'inc-003',

    title: 'VAPIX: motion (pre-filter)',

    cameraId: 'cam-garden',

    cameraName: 'Garden',

    severity: 'low',

    status: 'closed',

    occurredAt: t26h,

    ruleName: 'Axis motion',

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

