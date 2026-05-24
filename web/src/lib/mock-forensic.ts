import type { ForensicIncident, ForensicRange, RecordingSegment } from '@/types/forensic'

import { mockBestPicture } from '@/lib/mock-best-picture'



function clipAround(iso: string, preSec: number, postSec: number) {

  const t = new Date(iso).getTime()

  return {

    clipStartAt: new Date(t - preSec * 1000).toISOString(),

    clipEndAt: new Date(t + postSec * 1000).toISOString(),

    durationSec: preSec + postSec,

  }

}



/** Extended mock — all alarms on the timeline */

export const mockForensicIncidents: ForensicIncident[] = [

  {

    id: 'inc-001',

    title: 'Person on driveway (after quiet hours)',

    cameraId: 'cam-driveway',

    cameraName: 'Driveway',

    severity: 'medium',

    status: 'open',

    occurredAt: new Date(Date.now() - 45 * 60_000).toISOString(),

    ruleName: 'Zone — driveway night',

    confidence: 0.89,

    bestPicture: mockBestPicture(

      new Date(Date.now() - 45 * 60_000).toISOString(),

      0.89,

      [0.42, 0.38, 0.12, 0.28],

    ),

    faceMatch: {

      profileId: null,

      displayName: 'Unknown person',

      confidence: 0.82,

      unknown: true,

    },

    ...clipAround(new Date(Date.now() - 45 * 60_000).toISOString(), 10, 20),

  },

  {

    id: 'inc-002',

    title: 'Vehicle at entry',

    cameraId: 'cam-entry',

    cameraName: 'Entry',

    severity: 'low',

    status: 'acknowledged',

    occurredAt: new Date(Date.now() - 4 * 3600_000).toISOString(),

    ruleName: 'Vehicle — daytime',

    confidence: 0.76,

    bestPicture: mockBestPicture(

      new Date(Date.now() - 4 * 3600_000).toISOString(),

      0.76,

      [0.18, 0.45, 0.35, 0.22],

    ),

    ...clipAround(new Date(Date.now() - 4 * 3600_000).toISOString(), 10, 25),

  },

  {

    id: 'inc-003',

    title: 'VAPIX: motion (pre-filter)',

    cameraId: 'cam-garden',

    cameraName: 'Garden',

    severity: 'low',

    status: 'closed',

    occurredAt: new Date(Date.now() - 26 * 3600_000).toISOString(),

    ruleName: 'Axis motion',

    bestPicture: mockBestPicture(

      new Date(Date.now() - 26 * 3600_000).toISOString(),

      0.55,

      [0.55, 0.5, 0.08, 0.15],

    ),

    faceMatch: {

      profileId: 'face-003',

      displayName: 'Courier (recurring)',

      confidence: 0.88,

      unknown: false,

    },

    ...clipAround(new Date(Date.now() - 26 * 3600_000).toISOString(), 5, 15),

  },

  {

    id: 'inc-004',

    title: 'Person — garage (no response)',

    cameraId: 'cam-garage',

    cameraName: 'Garage',

    severity: 'high',

    status: 'open',

    occurredAt: new Date(Date.now() - 8 * 3600_000).toISOString(),

    ruleName: 'Night — garage',

    confidence: 0.92,

    bestPicture: mockBestPicture(

      new Date(Date.now() - 8 * 3600_000).toISOString(),

      0.92,

      [0.3, 0.32, 0.14, 0.35],

    ),

    faceMatch: {

      profileId: null,

      displayName: 'Unknown person',

      confidence: 0.79,

      unknown: true,

    },

    ...clipAround(new Date(Date.now() - 8 * 3600_000).toISOString(), 15, 30),

  },

  {

    id: 'inc-005',

    title: 'Package left at entry',

    cameraId: 'cam-entry',

    cameraName: 'Entry',

    severity: 'low',

    status: 'closed',

    occurredAt: new Date(Date.now() - 52 * 3600_000).toISOString(),

    ruleName: 'Object in zone',

    confidence: 0.68,

    bestPicture: mockBestPicture(

      new Date(Date.now() - 52 * 3600_000).toISOString(),

      0.68,

      [0.48, 0.55, 0.15, 0.12],

    ),

    ...clipAround(new Date(Date.now() - 52 * 3600_000).toISOString(), 10, 20),

  },

  {

    id: 'inc-006',

    title: 'Person — driveway (daytime)',

    cameraId: 'cam-driveway',

    cameraName: 'Driveway',

    severity: 'low',

    status: 'closed',

    occurredAt: new Date(Date.now() - 68 * 3600_000).toISOString(),

    ruleName: 'Person — daytime',

    confidence: 0.84,

    bestPicture: mockBestPicture(

      new Date(Date.now() - 68 * 3600_000).toISOString(),

      0.84,

      [0.62, 0.4, 0.1, 0.25],

    ),

    ...clipAround(new Date(Date.now() - 68 * 3600_000).toISOString(), 10, 15),

  },

  {

    id: 'inc-007',

    title: 'Vehicle — driveway',

    cameraId: 'cam-driveway',

    cameraName: 'Driveway',

    severity: 'medium',

    status: 'acknowledged',

    occurredAt: new Date(Date.now() - 5 * 3600_000).toISOString(),

    ruleName: 'Vehicle — driveway',

    confidence: 0.81,

    bestPicture: mockBestPicture(

      new Date(Date.now() - 5 * 3600_000).toISOString(),

      0.81,

      [0.08, 0.42, 0.4, 0.25],

    ),

    ...clipAround(new Date(Date.now() - 5 * 3600_000).toISOString(), 10, 20),

  },

]



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



export function mockRecordingSegments(

  rangeStart: Date,

  rangeEnd: Date,

  cameraIds: string[],

): RecordingSegment[] {

  const segments: RecordingSegment[] = []

  for (const cameraId of cameraIds) {

    if (cameraId === 'cam-garage') continue

    segments.push({

      id: `seg-${cameraId}`,

      cameraId,

      startAt: rangeStart.toISOString(),

      endAt: rangeEnd.toISOString(),

    })

  }

  return segments

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



/** Find camera host for an incident */

export function cameraHostForIncident(

  incident: { cameraId: string },

  cameras: { id: string; host: string }[],

): string | undefined {

  return cameras.find((c) => c.id === incident.cameraId)?.host

}

