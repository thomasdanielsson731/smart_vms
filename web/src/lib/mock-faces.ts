import type { FaceProfile, FaceRecognitionEvent } from '@/types/face'



export const defaultFaceProfiles: FaceProfile[] = [

  {

    id: 'face-001',

    name: 'Thomas',

    role: 'household',

    enrolledAt: new Date(Date.now() - 30 * 86400_000).toISOString(),

    color: '#3b82f6',

    notes: 'Primary owner',

    rememberedByCameras: ['cam-driveway', 'cam-entry'],

    enrollment: {

      cameraId: 'cam-driveway',

      cameraName: 'Driveway',

      capturedAt: new Date(Date.now() - 30 * 86400_000).toISOString(),

      mode: 'live',

      bboxNorm: [0.38, 0.28, 0.14, 0.22],

    },

  },

  {

    id: 'face-002',

    name: 'Anna',

    role: 'household',

    enrolledAt: new Date(Date.now() - 28 * 86400_000).toISOString(),

    color: '#8b5cf6',

    rememberedByCameras: ['cam-entry'],

    enrollment: {

      cameraId: 'cam-entry',

      cameraName: 'Entry',

      capturedAt: new Date(Date.now() - 28 * 86400_000).toISOString(),

      mode: 'live',

      bboxNorm: [0.45, 0.32, 0.12, 0.19],

    },

  },

  {

    id: 'face-003',

    name: 'Courier (recurring)',

    role: 'service',

    enrolledAt: new Date(Date.now() - 14 * 86400_000).toISOString(),

    color: '#f59e0b',

    notes: 'Added after three deliveries',

    rememberedByCameras: ['cam-driveway'],

    enrollment: {

      cameraId: 'cam-driveway',

      cameraName: 'Driveway',

      capturedAt: new Date(Date.now() - 14 * 86400_000).toISOString(),

      mode: 'playback',

      bboxNorm: [0.52, 0.4, 0.11, 0.17],

      playbackPosition: 60,

    },

  },

]



export const mockFaceEvents: FaceRecognitionEvent[] = [

  {

    id: 'frec-001',

    occurredAt: new Date(Date.now() - 45 * 60_000).toISOString(),

    cameraId: 'cam-driveway',

    cameraName: 'Driveway',

    incidentId: 'inc-001',

    match: {

      profileId: null,

      displayName: 'Unknown person',

      confidence: 0.82,

      unknown: true,

    },

  },

  {

    id: 'frec-002',

    occurredAt: new Date(Date.now() - 3 * 3600_000).toISOString(),

    cameraId: 'cam-entry',

    cameraName: 'Entry',

    match: {

      profileId: 'face-001',

      displayName: 'Thomas',

      confidence: 0.91,

      unknown: false,

    },

  },

  {

    id: 'frec-003',

    occurredAt: new Date(Date.now() - 26 * 3600_000).toISOString(),

    cameraId: 'cam-driveway',

    cameraName: 'Driveway',

    incidentId: 'inc-004',

    match: {

      profileId: 'face-003',

      displayName: 'Courier (recurring)',

      confidence: 0.88,

      unknown: false,

    },

  },

  {

    id: 'frec-004',

    occurredAt: new Date(Date.now() - 2 * 86400_000).toISOString(),

    cameraId: 'cam-garden',

    cameraName: 'Garden',

    match: {

      profileId: null,

      displayName: 'Unknown person',

      confidence: 0.79,

      unknown: true,

    },

  },

]

